from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
import jwt
from datetime import datetime, timedelta
from dependencies import get_db, get_current_user_with_team, create_access_token
from models import User
from uuid import UUID
router = APIRouter(prefix="/user", tags=["User"])


# Pydantic Schemas for input validation
class UserRegister(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    id: UUID
    team_id: UUID | None = None
    team_name: str | None = None
    email: EmailStr
    is_verified: bool
    class Config:
        orm_mode = True


# Helper to create JWT access token

from sendmail import *
from celery_file import send_verification_email

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = bcrypt.hash(user.password)
    new_user = User(email=user.email, password=hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = generate_verification_token(new_user.email)
    print(token)
    send_verification_email.delay(new_user.email, token)

    return {"message": "Registered successfully, please verify your email", "user_id": new_user.id}


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not bcrypt.verify(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please verify your email before logging in.")

    # Create JWT token with user_id payload
    access_token = create_access_token(data={"user_id": db_user.id})
    response = JSONResponse(content={"message": "Logged in"})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # ✅ prevents JS access
        secure=True,    # ✅ send only over HTTPS
        samesite=None,  # ✅ CSRF protection    ||||   # TODO set to "lax" or "strict" in production
        max_age=60 * 60 * 24  # 1 day
    )
    return response



@router.get("/getprofile", response_model=UserProfile)
def get_profile(user_team: tuple = Depends(get_current_user_with_team)):
    user, team_name = user_team
    return UserProfile(
        id=user.id,
        team_id=user.team_id,
    team_name=team_name,
        email=user.email,
        is_verified=user.is_verified
    )

@router.post("/logout")
def logout(response: JSONResponse):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out successfully"}