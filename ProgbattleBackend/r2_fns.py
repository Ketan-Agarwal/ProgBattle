import random
import uuid
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Team, Round2Match, Submission
import asyncio
from wsfile import manager

GROUP_COUNT = 4
TEAMS_PER_GROUP = 4

def seed_round2_groups():
    db: Session = SessionLocal()

    try:
        # 1. Get top 16 teams with valid best submissions
        top_teams = db.query(Team).filter(Team.best_submission_id.isnot(None)).order_by(Team.best_score.desc()).limit(16).all()
        if len(top_teams) < 16:
            raise Exception("Need at least 16 teams with evaluated submissions.")

        # 2. Shuffle and split into 4 groups
        random.shuffle(top_teams)
        groups = [top_teams[i * TEAMS_PER_GROUP:(i + 1) * TEAMS_PER_GROUP] for i in range(GROUP_COUNT)]

        for group_id, group in enumerate(groups):
            for i in range(TEAMS_PER_GROUP):
                for j in range(i + 1, TEAMS_PER_GROUP):
                    team1 = group[i]
                    team2 = group[j]

                    submission1 = db.query(Submission).filter_by(id=team1.best_submission_id).first()
                    submission2 = db.query(Submission).filter_by(id=team2.best_submission_id).first()

                    if not submission1 or not submission2:
                        continue  # skip broken teams

                    match = Round2Match(
                        id=str(uuid.uuid4()),
                        team1_id=team1.id,
                        team2_id=team2.id,
                        team1_submission_id=submission1.id,
                        team2_submission_id=submission2.id,
                        group_id=group_id,
                        status="pending",
                        stage="group"
                    )

                    db.add(match)

        db.commit()
        print("✅ Round 2 group stage seeded successfully.")

    except Exception as e:
        db.rollback()
        print("❌ Failed to seed round 2:", str(e))

    finally:
        db.close()


from celery_file import evaluate_team_vs_team_match
from celery.exceptions import TimeoutError
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

MAX_PARALLEL_MATCHES = 8
RETRY_LIMIT = 3
TIMEOUT = 60  # seconds

def evaluate_all_pending_matches():
    db = SessionLocal()
    try:
        pending_matches = db.query(Round2Match).filter_by(status="pending").all()
        match_ids = [match.id for match in pending_matches]

        def run_with_retries(match_id):
            for attempt in range(RETRY_LIMIT):
                try:
                    # asyncio.run(manager.send_message(f"📤 Launching match {match_id} (attempt {attempt+1})"))
                    task = evaluate_team_vs_team_match.delay(match_id)
                    result = task.get(timeout=TIMEOUT)
                    return {"match_id": match_id, "success": True, "result": result}
                except TimeoutError:
                    asyncio.run(manager.broadcast({"type": "log", "data": f"⏱️ Match {match_id} timed out (attempt {attempt+1})"}))
                except Exception as e:
                    asyncio.run(manager.broadcast({"type": "log", "data": f"❌ Match {match_id} failed: {e}"}))
                    break  # Non-timeout errors should not retry
            return {"match_id": match_id, "success": False}

        # Use a thread pool to manage concurrency (8 matches at a time)
        results = []
        with ThreadPoolExecutor(max_workers=MAX_PARALLEL_MATCHES) as executor:
            futures = [executor.submit(run_with_retries, match_id) for match_id in match_ids]
            for future in as_completed(futures):
                results.append(future.result())

        # You now have full results:
        success = [r for r in results if r['success']]
        failed = [r for r in results if not r['success']]
        print(f"✅ Evaluated {len(success)} matches successfully.")
        print(f"⚠️ Failed {len(failed)} matches: {[r['match_id'] for r in failed]}")
        return results

    finally:
        db.close()


from collections import defaultdict
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Round2Match, Team

def compute_group_standings():
    db: Session = SessionLocal()
    try:
        matches = db.query(Round2Match).filter_by(status="evaluated").all()

        # {group_id: {team_id: [points, score_diff]}}
        group_scores = defaultdict(lambda: defaultdict(lambda: [0, 0.0]))

        for match in matches:
            group_id = match.group_id

            if match.team1_score > match.team2_score:
                group_scores[group_id][match.team1_id][0] += 3
            elif match.team2_score > match.team1_score:
                group_scores[group_id][match.team2_id][0] += 3
            else:
                group_scores[group_id][match.team1_id][0] += 1
                group_scores[group_id][match.team2_id][0] += 1

            # Score diff
            group_scores[group_id][match.team1_id][1] += match.team1_score - match.team2_score
            group_scores[group_id][match.team2_id][1] += match.team2_score - match.team1_score

        top_teams = []

        for group_id, teams in group_scores.items():
            sorted_teams = sorted(teams.items(), key=lambda x: (x[1][0], x[1][1]), reverse=True)
            group_top2 = [team_id for team_id, _ in sorted_teams[:2]]
            top_teams.extend(group_top2)

            print(f"✅ Group {group_id} Top 2: {group_top2}")

        return top_teams

    finally:
        db.close()


def seed_next_knockout_round(winner_team_ids, stage: str):
    assert len(winner_team_ids) % 2 == 0, "Team count must be even."

    db = SessionLocal()
    try:
        random.shuffle(winner_team_ids)
        next_match_ids = []

        for i in range(0, len(winner_team_ids), 2):
            team1_id = winner_team_ids[i]
            team2_id = winner_team_ids[i + 1]

            team1 = db.query(Team).filter_by(id=team1_id).first()
            team2 = db.query(Team).filter_by(id=team2_id).first()

            sub1 = team1.best_submission_id
            sub2 = team2.best_submission_id

            match = Round2Match(
                id=str(uuid.uuid4()),
                team1_id=team1.id,
                team2_id=team2.id,
                team1_submission_id=sub1,
                team2_submission_id=sub2,
                group_id=None,
                status="pending",
                stage=stage
            )
            db.add(match)
            asyncio.run(manager.broadcast({
    "type": "match_update",
    "data": {
        "id": match.id,
        "team1_name": team1.name,
        "team2_name": team2.name,
        "team1_score": None,
        "team2_score": None,
        "status": "pending",
        "group_id": match.group_id,
        stage: stage
    }
}))
            next_match_ids.append(match.id)

        db.commit()
        print(f"✅ Seeded {len(next_match_ids)} knockout matches.")
        return next_match_ids

    finally:
        db.close()

def get_winners(match_ids):
    db = SessionLocal()
    winners = []

    try:
        matches = db.query(Round2Match).filter(Round2Match.id.in_(match_ids)).all()
        for match in matches:
            if match.status != "evaluated":
                raise Exception(f"Match {match.id} not evaluated yet.")

            if str(match.team1_id) == str(match.winner_id):
                winners.append(match.team1_id)
            elif str(match.team2_id) == str(match.winner_id):
                winners.append(match.team2_id)
            else:

                raise Exception(f"Match {match.id} is a draw. Resolve tie manually. Winner is {match.winner_id}. Team1: {match.team1_id}, Team2: {match.team2_id}")

        return winners
    finally:
        db.close()
