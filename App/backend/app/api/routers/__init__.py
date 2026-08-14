# Ref: B-001, B-017, B2-001..B2-007
from app.api.routers.auth import router as auth_router
from app.api.routers.users import router as users_router
from app.api.routers.posts import router as posts_router
from app.api.routers.dashboard import router as dashboard_router
from app.api.routers.uploads import router as uploads_router
from app.api.routers.conversations import router as conversations_router
from app.api.routers.notifications import router as notifications_router
from app.api.routers.password_reset import router as password_reset_router
from app.api.routers.websocket import router as websocket_router

__all__ = [
    "auth_router",
    "users_router",
    "posts_router",
    "dashboard_router",
    "uploads_router",
    "conversations_router",
    "notifications_router",
    "password_reset_router",
    "websocket_router",
]
