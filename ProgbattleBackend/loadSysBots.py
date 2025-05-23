from models import SystemBot
from database import SessionLocal
import os

db = SessionLocal()

bots = [
    {"name": "Bot A", "file_path": "bots/bot1.py"},
    {"name": "Bot B", "file_path": "bots/bot2.py"},
    {"name": "Bot C", "file_path": "bots/bot3.py"},
    {"name": "Bot D", "file_path": "bots/bot4.py"},
]

for b in bots:
    if not os.path.isfile(b["file_path"]):
        print(f"Skipping {b['name']}: File not found")
        continue

    bot = SystemBot(name=b["name"], file_path=b["file_path"])
    db.add(bot)

db.commit()
db.close()
