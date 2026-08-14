# Ref: RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013, RF-014, B-007, B-008, B-009, B-010, RF2-006, B2-002
from typing import List
from fastapi import APIRouter, Depends, status, Query, Form, File, UploadFile
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.post import PostCreate, PostResponse
from app.schemas.comment import CommentCreate, CommentResponse
from app.schemas.like import LikeToggleResponse
from app.services.post_service import PostService

router = APIRouter(prefix="/api/posts", tags=["Publicaciones"])

@router.get("", response_model=List[PostResponse], status_code=status.HTTP_200_OK)
def get_feed(
    scope: str = Query("all", description="Filtro de feed: 'all' o 'following'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PostService(db)
    return service.get_feed(current_user, scope=scope)

@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PostService(db)
    return service.create_post(current_user, data)

@router.post("/with-image", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post_with_image(
    content: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PostService(db)
    return service.create_post_with_image(current_user, content, file)

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PostService(db)
    service.delete_post(current_user, post_id)
    return None

@router.post("/{post_id}/like", response_model=LikeToggleResponse, status_code=status.HTTP_200_OK)
def toggle_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PostService(db)
    return service.toggle_like(current_user, post_id)

@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    post_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PostService(db)
    return service.add_comment(current_user, post_id, data)
