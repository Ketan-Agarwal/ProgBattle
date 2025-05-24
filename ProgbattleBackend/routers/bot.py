from fastapi import APIRouter, Form, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user, check_submission_rate_limit
from models import Submission
from datetime import datetime
from zoneinfo import ZoneInfo
import uuid
import os

router = APIRouter(prefix="/bot", tags=["Bot"])

@router.post("/submit")
def submit_bot(file: UploadFile = File(...), bot_name: str = Form(...), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not current_user.team_id:
        raise HTTPException(status_code=400, detail="Join a team to submit a bot.")
    if not file.filename.endswith(".py"):
        raise HTTPException(status_code=400, detail="Only .py files allowed.")

    # DONE: Implement rate limitingd
    check_submission_rate_limit(current_user.team_id, db)

    # Save the uploaded file
    submission_id = str(uuid.uuid4())
    submission_name = f"{submission_id}.py"
    bot_path = os.path.join("submissions", submission_name)
    os.makedirs("submissions", exist_ok=True)

    with open(bot_path, "wb") as f:
        f.write(file.file.read())

    # Insert submission into DB with status PENDING
    submission = Submission(
        id=submission_id,
        bot_name=bot_name,
        user_id=current_user.id,
        team_id=current_user.team_id,
        created_at = datetime.now(ZoneInfo("Asia/Kolkata")),
        score=None,  # to be updated later
        status="pending",
    )
    db.add(submission)
    db.commit()
    
    # Trigger async evaluation (via Celery ideally)
    from celery_file import evaluate_bot
    evaluate_bot.delay(bot_path=bot_path, submission_id=submission_id, team_id=current_user.team_id)

    return {"message": "Bot submitted successfully.", "submission_id": submission_id}
