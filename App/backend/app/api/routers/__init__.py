# Ref: B-001, B-017
from app.api.routers.auth import router as auth_router
from app.api.routers.users import router as users_router
from app.api.routers.posts import router as posts_router
from app.api.routers.dashboard import router as dashboard_router

__all__ = [
    "auth_router",
    "users_router",
    "posts_router",
    "dashboard_router",
]
