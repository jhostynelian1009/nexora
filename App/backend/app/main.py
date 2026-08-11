# Ref: RF-020, RNF-006, RNF-008, B-001, B-017
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api.deps import get_db
from app.api.routers import auth_router, users_router, posts_router, dashboard_router
from app.db.seeder import seed_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema exists on startup
    try:
        Base.metadata.create_all(bind=engine)
        db = next(get_db())
        try:
            seed_data(db)
        finally:
            db.close()
    except Exception as e:
        print(f"[Lifespan Warning] Could not initialize DB on startup: {e}")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="API REST de la plataforma social y académica Nexora",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(posts_router)
app.include_router(dashboard_router)

@app.get("/health", status_code=status.HTTP_200_OK, tags=["Salud"])
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Base de datos inalcanzable: {str(e)}"
        )

    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "database": db_status
    }
