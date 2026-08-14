# Ref: RF-006, B-006, RF2-001, RF2-002, RF2-003, RF2-004, RF2-005, B2-002
from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse, UserProfilePublic, UserSummary
from app.schemas.post import PostResponse
from app.services.user_service import UserService
from app.services.post_service import PostService

router = APIRouter(prefix="/api/users", tags=["Usuarios"])

@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def update_user_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    return service.update_profile(current_user, data)

@router.get("/search", response_model=List[UserSummary], status_code=status.HTTP_200_OK)
def search_users(
    q: str = Query("", description="Búsqueda por nombre o carrera"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    return service.search_users(q, current_user)

@router.get("/{user_id}", response_model=UserProfilePublic, status_code=status.HTTP_200_OK)
def get_public_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    return service.get_public_profile(user_id, current_user)

@router.get("/{user_id}/posts", response_model=List[PostResponse], status_code=status.HTTP_200_OK)
def get_user_posts(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post_service = PostService(db)
    return post_service.get_user_posts(user_id, current_user)

@router.get("/{user_id}/followers", response_model=List[UserSummary], status_code=status.HTTP_200_OK)
def get_user_followers(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    return service.get_followers(user_id, current_user)

@router.get("/{user_id}/following", response_model=List[UserSummary], status_code=status.HTTP_200_OK)
def get_user_following(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    return service.get_following(user_id, current_user)

@router.post("/{user_id}/follow", status_code=status.HTTP_200_OK)
def follow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    return service.follow_user(user_id, current_user)

@router.delete("/{user_id}/follow", status_code=status.HTTP_200_OK)
def unfollow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    return service.unfollow_user(user_id, current_user)
