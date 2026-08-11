# Ref: RF-013, RF-014, B-010
from typing import List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, asc
from app.models.comment import Comment

class CommentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, comment: Comment) -> Comment:
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        # Reload with author
        stmt = (
            select(Comment)
            .where(Comment.id == comment.id)
            .options(joinedload(Comment.author))
        )
        return self.db.scalars(stmt).first()  # type: ignore

    def get_by_post(self, post_id: int) -> List[Comment]:
        stmt = (
            select(Comment)
            .where(Comment.post_id == post_id)
            .options(joinedload(Comment.author))
            .order_by(asc(Comment.created_at))
        )
        return list(self.db.scalars(stmt).all())

    def count_all(self) -> int:
        return self.db.query(Comment).count()
