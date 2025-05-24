import asyncio
import os
import shutil
import uuid
import subprocess
from celery import Celery, chord
from sqlalchemy.orm import Session
from dependencies import parse_score_from_log
from database import SessionLocal
from models import Submission, SystemBot, MatchResult, Team
import os
from dotenv import load_dotenv
from celery import Celery
from email.message import EmailMessage
from itsdangerous import URLSafeTimedSerializer
import smtplib
load_dotenv()

SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
FRONTEND_URL = os.environ.get("FRONTEND_URL")
SECRET_KEY = os.environ.get("SECRET_KEY")
serializer = URLSafeTimedSerializer(SECRET_KEY)


celery_app = Celery(__name__, broker="redis://localhost:6379/0", backend="redis://localhost:6379/0")

@celery_app.task
def send_verification_email(email: str, token: str):
    print(f"Sending verification email to {email}")
    print(f"user: {SMTP_USER}")
    link = f"{FRONTEND_URL}/verify-email?token={token}"
    message = EmailMessage()
    message.set_content(f"Click the link to verify your email: {link}")
    message["Subject"] = "Verify your email"
    message["From"] = "ProgBattle <verify@progbattle.pclub>"
    message["To"] = email

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(message)
    
    print(f"Verification email sent to {email}")


@celery_app.task
def evaluate_match(submission_id, system_bot_id, match_num, user_bot_path):
    db: Session = SessionLocal()
    try:
        bot = db.query(SystemBot).filter_by(id=system_bot_id).first()
        if not bot:
            raise Exception(f"System bot {system_bot_id} not found")

        temp_dir = f"/tmp/evals/eval_{uuid.uuid4()}"
        os.makedirs(temp_dir, exist_ok=True)

        user_bot_temp = os.path.join(temp_dir, "user_bot.py")
        shutil.copy(user_bot_path, user_bot_temp)

        sys_bot_temp = os.path.join(temp_dir, "system_bot.py")
        shutil.copy(bot.file_path, sys_bot_temp)

        logs_dir = os.path.join(temp_dir, "logs")
        os.makedirs(logs_dir, exist_ok=True)

        result = subprocess.run([
            "sudo", "docker", "run", "--rm",
            "--mount", f"type=bind,source={os.path.abspath(temp_dir)},target=/app/bots",
            "--mount", f"type=bind,source={os.path.abspath(logs_dir)},target=/output",
            "bot-runner-1",
            "bots/system_bot.py", "bots/user_bot.py"
        ], capture_output=True, text=True)

        if result.returncode != 0:
            raise Exception(f"Docker failed: {result.stderr}")

        log_file = os.path.join(logs_dir, "game_log.csv")
        if not os.path.exists(log_file):
            raise Exception("Missing game_log.csv")

        sys_score, user_score = parse_score_from_log(log_file)

        log_storage_path = f"logs/game_log_{uuid.uuid4()}.csv"
        os.makedirs(os.path.dirname(log_storage_path), exist_ok=True)
        shutil.copy(log_file, log_storage_path)

        match_result = MatchResult(
            submission_id=submission_id,
            system_bot_id=system_bot_id,
            user_score=user_score,
            system_score=sys_score,
            log_path=log_storage_path,
            match_number=match_num + 1
        )
        db.add(match_result)
        db.commit()

        return {"user": user_score, "system": sys_score}
    
    except Exception as e:
        return {"error": str(e)}
    
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
        db.close()


@celery_app.task
def finalize_score(match_results_data, submission_id, team_id):
    db: Session = SessionLocal()
    try:
        submission = db.query(Submission).filter_by(id=submission_id).first()
        if not submission:
            raise Exception("Invalid submission ID.")

        all_scores = [(res['user'], res['system']) for res in match_results_data if 'user' in res]

        if not all_scores:
            raise Exception("No valid match scores.")

        total_ratio = sum(user / (user + sys + 1e-6) for user, sys in all_scores) / len(all_scores)
        base_score = round(total_ratio * 100, 2)

        bonus = 0
        if all(user > sys for user, sys in all_scores):
            bonus += 5
        if all(user > 0.5 * sys for user, sys in all_scores):
            bonus += 5

        final_score = base_score + bonus

        submission.score = final_score
        submission.status = "evaluated"
        db.commit()

        team = db.query(Team).filter_by(id=team_id).first()
        if team:
            best_submission = db.query(Submission)\
                .filter_by(team_id=team_id, status="evaluated")\
                .order_by(Submission.score.desc())\
                .first()
            
            if best_submission and team.best_submission_id != best_submission.id:
                team.best_submission_id = best_submission.id
                team.best_score = best_submission.score
                db.commit()

    except Exception as e:
        submission.status = "failed"
        db.commit()
        raise e
    
    finally:
        db.close()

from wsfile import manager

@celery_app.task
def evaluate_bot(bot_path: str, submission_id: str, team_id: str):
    db: Session = SessionLocal()
    try:
        system_bots = db.query(SystemBot).all()
        if not system_bots:
            raise Exception("No system bots configured in the database.")

        submission = db.query(Submission).filter_by(id=submission_id).first()
        if not submission:
            raise Exception("Invalid submission ID.")

        NUM_MATCHES_PER_BOT = 2
        task_group = []

        for bot in system_bots:
            for match_num in range(NUM_MATCHES_PER_BOT):
                task_group.append(evaluate_match.s(submission_id, bot.id, match_num, bot_path))

        chord(task_group)(finalize_score.s(submission_id, team_id))

    except Exception as e:
        submission = db.query(Submission).filter_by(id=submission_id).first()
        if submission:
            submission.status = "failed"
            db.commit()
        raise e

    finally:
        db.close()

    
from models import Round2Match
@celery_app.task
def evaluate_team_vs_team_match(match_id: str):
    db: Session = SessionLocal()
    try:
        match = db.query(Round2Match).filter_by(id=match_id).first()
        if not match:
            raise Exception(f"Match {match_id} not found")

        team1_bot = db.query(Submission).filter_by(id=match.team1_submission_id).first()
        team2_bot = db.query(Submission).filter_by(id=match.team2_submission_id).first()

        if not team1_bot or not team2_bot:
            raise Exception("Missing team submissions.")

        def run_match_once():
            temp_dir = os.path.abspath(f"./docker_temp/match_{uuid.uuid4()}")
            os.makedirs(temp_dir, exist_ok=True)

            team1_path = os.path.join(temp_dir, "team1_bot.py")
            team2_path = os.path.join(temp_dir, "team2_bot.py")

            shutil.copy(f"submissions/{team1_bot.id}.py", team1_path)
            shutil.copy(f"submissions/{team2_bot.id}.py", team2_path)

            logs_dir = os.path.join(temp_dir, "logs")
            os.makedirs(logs_dir, exist_ok=True)

            result = subprocess.run([
                "sudo", "docker", "run", "--rm",
                "--mount", f"type=bind,source={os.path.abspath(temp_dir)},target=/app/bots",
                "--mount", f"type=bind,source={os.path.abspath(logs_dir)},target=/output",
                "bot-runner-1",
                "bots/team1_bot.py", "bots/team2_bot.py"
            ], capture_output=True, text=True)

            if result.returncode != 0:
                raise Exception(f"Docker failed: {result.stderr}")

            log_file = os.path.join(logs_dir, "game_log.csv")
            if not os.path.exists(log_file):
                raise Exception("Missing game_log.csv")

            score1, score2 = parse_score_from_log(log_file)
            return score1, score2, log_file, temp_dir

        # Run initial match
        team1_score, team2_score, log_file, temp_dir = run_match_once()

        log_storage_path = f"logs/match_{uuid.uuid4()}.csv"
        os.makedirs(os.path.dirname(log_storage_path), exist_ok=True)
        shutil.copy(log_file, log_storage_path)

        match.team1_score = team1_score
        match.team2_score = team2_score
        match.log_path = log_storage_path

        # Handle tiebreaker if needed
        if team1_score > team2_score:
            match.winner_id = match.team1_id
        elif team2_score > team1_score:
            match.winner_id = match.team2_id
        else:
            # Tiebreaker: Best of 3
            team1_wins = 0
            team2_wins = 0
            for _ in range(2):  # We already ran one
                t1, t2, _, temp_dir2 = run_match_once()
                if t1 > t2:
                    team1_wins += 1
                elif t2 > t1:
                    team2_wins += 1
                shutil.rmtree(temp_dir2, ignore_errors=True)

            if team1_score > team2_score:
                team1_wins += 1
            elif team2_score > team1_score:
                team2_wins += 1

            if team1_wins > team2_wins:
                match.winner_id = match.team1_id
            elif team2_wins > team1_wins:
                match.winner_id = match.team2_id
            else:
                import random
                match.winner_id = random.choice([match.team1_id, match.team2_id])
        asyncio.run(manager.broadcast({
    "type": "match_update",
    "data": {
        "id": match.id,
        "team1_name": match.team1.name,
        "team2_name": match.team2.name,
        "team1_score": team1_score,
        "team2_score": team2_score,
        "status": "evaluated",
        "group_id": match.group_id,
        "stage": match.stage
    }
}))
        match.status = "evaluated"
        db.commit()
        return {
            "match_id": match.id,
            "team1_score": team1_score,
            "team2_score": team2_score,
            "winner_id": match.winner_id
        }

    except Exception as e:
        match.status = "failed"
        db.commit()
        return {"error": str(e)}

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
        db.close()
