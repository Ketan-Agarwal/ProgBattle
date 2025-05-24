import bcrypt
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from models import Submission, Team, User
from dependencies import get_db, get_current_user
router = APIRouter(prefix="/teams", tags=["Team"])


# Team creation and management
class TeamCreate(BaseModel):
    name: str
    max_size: int = Field(..., ge=1, le=5)
    team_password: str = Field(...)


# Team creation
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_team(data: TeamCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.team_id:
        raise HTTPException(status_code=400, detail="You are already in a team.")

    if db.query(Team).filter(Team.name == data.name).first():
        raise HTTPException(status_code=400, detail="Team name already taken.")
    print(data.team_password)
    # Hash the join password before storing
    hashed_password = pwd_context.hash(data.team_password)

    # Create the team with hashed password
    new_team = Team(
        name=data.name,
        max_size=data.max_size,
        join_password=hashed_password
    )
    db.add(new_team)
    db.commit()
    db.refresh(new_team)

    # Assign the user to this team
    current_user.team_id = new_team.id
    db.commit()
    db.refresh(current_user)

    return {"message": "Team created", "team_id": new_team.id}

class JoinTeamRequest(BaseModel):
    team_id: str
    team_password: str

@router.post("/join")
def join_team(request: JoinTeamRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.team_id is not None:
        raise HTTPException(status_code=400, detail="You are already in a team.")

    team = db.query(Team).filter(Team.id == request.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    if not team.join_password or not pwd_context.verify(request.team_password, team.join_password):
        raise HTTPException(status_code=403, detail="Invalid password.")


    member_count = db.query(User).filter(User.team_id == team.id).count()
    if member_count >= team.max_size:
        raise HTTPException(status_code=400, detail="Team is already full.")

    current_user.team_id = team.id
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {"message": f"Successfully joined team: {team.name}"}


# @router.post("/leave")
# def leave_team(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
#     if current_user.team_id is None:
#         raise HTTPException(status_code=400, detail="You are not in a team.")

#     # Remove user from team
#     current_user.team_id = None
#     db.commit()
#     db.refresh(current_user)

#     return {"message": "Successfully left the team."}


@router.get("/members")
def get_team_members(team_id: UUID = Query(...), db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == str(team_id)).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    members = db.query(User).filter(User.team_id == str(team_id)).all()
    return {
        "team_id": str(team.id),
        "team_name": team.name,
        "members": [{"user_id": m.id, "email": m.email} for m in members]
    }

@router.get("/submissions")
def get_team_submissions(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.team_id:
        raise HTTPException(status_code=400, detail="You are not in any team.")

    submissions = db.query(Submission).filter(Submission.team_id == current_user.team_id).order_by(Submission.created_at.desc()).all()
    if not submissions:
        raise HTTPException(status_code=404, detail="No submissions found for this team.")
    return {
        "team_id": current_user.team_id,
        "submissions": [
            {
                "submission_id": s.id,
                "bot_name": s.bot_name,
                "user_id": s.user_id,
                "score": s.score,
                "created_at": s.created_at,
                "status": s.status,
            }
            for s in submissions
        ]
    }


@router.get("/getteams")
def list_teams(db: Session = Depends(get_db)):
    teams = db.query(Team).all()
    if not teams:
        raise HTTPException(status_code=404, detail="No teams found.")
    return {
        "teams": [
            {
                "team_id": str(team.id),
                "team_name": team.name,
                "member_count": db.query(User).filter(User.team_id == team.id).count(),
            }
            for team in teams
        ]
    }

@router.post("/challenge/{target_team_id}")
def challenge_team(target_team_id: int, current_user=Depends(get_current_user), db=Depends(get_db)):
    # create a challenge record
    ...
