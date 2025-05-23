from fastapi import APIRouter, UploadFile, Form
import os
import subprocess
# from models import Submission
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Base, engine
Base.metadata.create_all(bind=engine)
router = APIRouter()

UPLOAD_DIR = "bots/uploads"
SYSTEM_BOT = "bots/system/system_bot.py"  # Place your system bot here

@router.post("/submit")
def submit(user_id: int = Form(...), file: UploadFile = None):
    db = SessionLocal()
    filename = f"{UPLOAD_DIR}/{user_id}_{file.filename}"
    with open(filename, "wb") as f:
        f.write(file.file.read())

    cmd = f"python3 engine.py --p1 {filename} --p2 {SYSTEM_BOT}"
    proc = subprocess.run(cmd.split(), capture_output=True)

    score = parse_score_from_log()  # implement this
    new_sub = Submission(user_id=user_id, filename=filename, score=score)
    db.add(new_sub)
    db.commit()
    return {"score": score}
