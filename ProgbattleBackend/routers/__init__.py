# app/routers/__init__.py

from .user import router as user_router
from .team import router as team_router
from .bot import router as bot_router
from .others import router as other_router

__all__ = [
    "user_router",
    "team_router",
    "bot_router",
    "other_router",
]