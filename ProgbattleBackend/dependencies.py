from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from database import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from dependencies import get_db
from models import Team, User

import os
# Same as in your main file (ideally keep in config/env)
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

from uuid import UUID
from fastapi import Request

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: UUID = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user



def get_current_user_with_team(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> tuple[User, str | None]:
    team_name = None
    if user.team_id:
        team = db.query(Team).filter(Team.id == user.team_id).first()
        team_name = team.name if team else None
    return user, team_name

from models import Submission

import csv

def parse_score_from_log(log_path: str) -> tuple[int, int]:
    with open(log_path, "r") as f:
        reader = list(csv.DictReader(f))
        if not reader:
            raise Exception("Empty log file")
        last_row = reader[-1]
        return int(last_row["score_bot1"]), int(last_row["score_bot2"])


def is_rate_limited(user_id: UUID, db: Session):
    last_hour_submissions = db.query(Submission).filter(
        Submission.user_id == user_id,
        Submission.created_at > datetime.now() - timedelta(hours=1)
    ).count()
    return last_hour_submissions >= 5


def check_submission_rate_limit(team_id: UUID, db: Session):
    one_hour_ago = datetime.now() - timedelta(hours=1)
    count = db.query(Submission).filter(
        Submission.team_id == team_id,
        Submission.created_at >= one_hour_ago
    ).count()
    if count >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Submission limit reached. Max {5} submissions per hour."
        )
