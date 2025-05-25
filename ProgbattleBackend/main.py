import asyncio
from fastapi import FastAPI, Request, WebSocketDisconnect, status, WebSocket
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
# from asdfef import router as bot_router
from database import engine
from models import Base
# from routers import bot, leaderboard, team, user
from routers import user_router, team_router, bot_router, other_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from wsfile import manager
import os
Base.metadata.create_all(bind=engine)
app = FastAPI()

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "Invalid input. Please check required fields."}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(bot_router)
app.include_router(user_router)
app.include_router(team_router)
app.include_router(bot_router)
app.include_router(other_router)

@app.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


from sqlalchemy.orm import Session
from database import engine
from dependencies import get_db
import models
from seed_data import populate_system_bots

@app.on_event("startup")
async def startup_event():
    print("Server starting... Populating DB if needed...")
    db: Session = next(get_db())

    # Only seed if needed to avoid duplication
    if not db.query(models.SystemBot).first():
        populate_system_bots(db)  # <-- your logic here
        print("✅ DB populated.")
    else:
        print("🟡 DB already populated.")
