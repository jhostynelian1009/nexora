# Ref: RF-011, RF-012, B-009
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.like import Like
from app.models.post import Post

class LikeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_like(self, user_id: int, post_id: int) -> Optional[Like]:
        stmt = select(Like).where(Like.user_id == user_id, Like.post_id == post_id)
        return self.db.scalars(stmt).first()

    def create(self, like: Like) -> Like:
        self.db.add(like)
        self.db.commit()
        self.db.refresh(like)
        return like

    def delete(self, like: Like) -> None:
        self.db.delete(like)
        self.db.commit()

    def count_by_post(self, post_id: int) -> int:
        return self.db.query(Like).filter(Like.post_id == post_id).count()

    def count_all(self) -> int:
        return self.db.query(Like).count()

    def count_likes_received_by_user(self, user_id: int) -> int:
        return (
            self.db.query(Like)
            .join(Post, Like.post_id == Post.id)
            .filter(Post.author_id == user_id)
            .count()
        )
