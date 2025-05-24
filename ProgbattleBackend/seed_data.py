# seed_data.py
from models import SystemBot
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

def populate_system_bots(db: Session):
    if db.query(SystemBot).first():
        print("System bots already exist. Skipping seeding.")
        return

    bots = [
        SystemBot(id=uuid.uuid4(), name="Bot A", file_path="bots/bot1.py", weight=1),
        SystemBot(id=uuid.uuid4(), name="Bot B", file_path="bots/bot2.py", weight=1),
        SystemBot(id=uuid.uuid4(), name="Bot C", file_path="bots/bot3.py", weight=1),
        SystemBot(id=uuid.uuid4(), name="Bot D", file_path="bots/bot4.py", weight=1),
    ]
    db.add_all(bots)
    db.commit()
    print("✅ Seeded system bots.")
