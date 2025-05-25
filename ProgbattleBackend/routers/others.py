from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from dependencies import get_current_user, get_db
from models import Submission, Team, MatchResult, Round2Match
from uuid import UUID
router = APIRouter()
from typing import Optional


@router.get("/")
def root():
    return {"message": "ProgBattle backend is running!"}


@router.get("/submission/{submission_id}/status")
def get_submission_status(submission_id: UUID, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    submission = db.query(Submission).filter_by(id=str(submission_id)).first()


    if not submission or submission.team_id != current_user.team_id:
        raise HTTPException(status_code=404, detail="Submission not found or not yours.")

    return {
        "name": submission.bot_name,
        "status": submission.status,  # e.g. PENDING / RUNNING / SUCCESS / FAILED
        "score": submission.score,
        "submitted_at": submission.created_at
    }
from fastapi import HTTPException
from pathlib import Path

@router.get("/submission/{submission_id}/logs")
def get_submission_logs(submission_id: UUID, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    match_results = db.query(MatchResult).filter_by(submission_id=str(submission_id)).all()

    if len(match_results) == 0:
        raise HTTPException(status_code=404, detail="No logs found for this submission.")

    logs_data = [
        {
            "log_id": match.id,
            "match_number": match.match_number,
            "system_bot_id": match.system_bot_id,
            "user_score": match.user_score,
            "system_score": match.system_score
        }
        for match in match_results
    ]


    return {"submission_id": str(submission_id), "logs": logs_data}

@router.get("/submissions/{submission_id}")
def get_submission(
    submission_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    submission = db.query(Submission).filter_by(id=str(submission_id)).first()

    if not submission or submission.team_id != current_user.team_id:
        raise HTTPException(status_code=404, detail="Submission not found or not yours.")

    filepath = f"./submissions/{submission_id}.py"

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Submitted code file not found.")

    try:
        with open(filepath, "r") as f:
            code = f.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error reading code file.")

    return {
        "bot_name": submission.bot_name,
        "code": code
    }

from fastapi.responses import FileResponse, PlainTextResponse
import os

@router.get("/logs/{log_id}", response_class=PlainTextResponse)
def get_log_by_id(log_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    match = db.query(MatchResult).filter_by(id=log_id).first()

    if not match:
        raise HTTPException(status_code=404, detail="Log not found.")

    if not match.submission or match.submission.team_id != current_user.team_id:
        raise HTTPException(status_code=403, detail="Access denied to this log.")

    log_path = match.log_path

    if not os.path.exists(log_path):
        raise HTTPException(status_code=500, detail="Log file is missing on the server.")

    with open(log_path, "r") as file:
        content = file.read()

    return content


@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    # Join Team → Submission using best_submission_id, and order by score
    leaderboard = (
        db.query(Team, Submission)
        .join(Submission, Team.best_submission_id == Submission.id)
        .order_by(Submission.score.desc())
        .all()
    )

    # Format nicely
    return [
        {
            "rank": i + 1,
            "team_id": team.id,
            "team_name": team.name,
            "score": submission.score,
            "bot_name": submission.bot_name,
            "submitted_at": submission.created_at.isoformat()
        }
        for i, (team, submission) in enumerate(leaderboard)
    ]


@router.post("/start-round-2")
def start_round_2(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Check if the user is an admin
    if not current_user.email.endswith("@admin.com"):
        raise HTTPException(status_code=403, detail="Only admins can start round 2.")

    # Check if round 2 has already started
    if db.query(Round2Match).count() > 0:
        raise HTTPException(status_code=400, detail="Round 2 has already started.")

    # Set all submissions to round 2\
    from r2 import run_round2;
    run_round2()

    return {"message": "Round 2 has been started."}


from pydantic import BaseModel

class Round2MatchOut(BaseModel):
    id: UUID
    group_id: Optional[int]
    team1_name: str
    team2_name: str
    winner_name: Optional[str]
    team1_score: Optional[float]
    team2_score: Optional[float]
    status: str
    stage: str

    class Config:
        orm_mode = False

@router.get("/r2")
def get_r2(db: Session = Depends(get_db)):
    match_count = db.query(Round2Match).count()
    return {"started": match_count > 0}
from sqlalchemy.orm import aliased

@router.get("/r2/matches", response_model=list[Round2MatchOut])
def get_round2_matches(db: Session = Depends(get_db)):
    Team1 = aliased(Team)
    Team2 = aliased(Team)

    matches = (
        db.query(
            Round2Match,
            Team1.name.label("team1_name"),
            Team2.name.label("team2_name")
        )
        .join(Team1, Round2Match.team1_id == Team1.id)
        .join(Team2, Round2Match.team2_id == Team2.id)
        .order_by(Round2Match.group_id, Round2Match.id)
        .all()
    )

    result = []
    for match, team1_name, team2_name in matches:
        winner_name = None
        if match.winner_id == match.team1_id:
            winner_name = team1_name
        elif match.winner_id == match.team2_id:
            winner_name = team2_name

        result.append(Round2MatchOut(
            id=match.id,
            group_id=match.group_id,
            team1_name=team1_name,
            team2_name=team2_name,
            winner_name=winner_name,
            team1_score=match.team1_score,
            team2_score=match.team2_score,
            status=match.status,
            stage=match.stage
        ))

    return result




@router.get("/r2/matches/{match_id}/logs")
def get_match_logs(match_id: str, db: Session = Depends(get_db)):
    print(f"Fetching logs for match ID: {match_id}")
    match = db.query(Round2Match).filter(Round2Match.id == match_id).first()
    print(f"Match found: {match}")
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if not match.log_path:
        raise HTTPException(status_code=404, detail="No log available")

    log_file = Path(match.log_path)
    if not log_file.exists():
        raise HTTPException(status_code=404, detail="Log file missing on disk")

    try:
        content = log_file.read_text()
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read log: {str(e)}")


from fastapi import APIRouter, HTTPException
from itsdangerous import BadSignature, SignatureExpired
from models import User
import serializer

from sendmail import confirm_verification_token
from pydantic import BaseModel

class TokenData(BaseModel):
    token: str

@router.post("/verify-email")
def verify_email(data: TokenData, db: Session = Depends(get_db)):
    email = confirm_verification_token(data.token)

    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        return {"message": "Email already verified"}

    user.is_verified = True
    db.commit()
    return {"message": "Email verified successfully"}
