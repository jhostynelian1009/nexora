# Ref: RF-007, RF-008, RF-009, RF-010, B-007, B-008, RF2-003, RF2-006, B2-002
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import select, desc
from app.models.post import Post
from app.models.comment import Comment

class PostRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, post_id: int) -> Optional[Post]:
        stmt = (
            select(Post)
            .where(Post.id == post_id)
            .options(
                joinedload(Post.author),
                selectinload(Post.comments).joinedload(Comment.author),
                selectinload(Post.likes)
            )
        )
        return self.db.scalars(stmt).first()

    def get_feed(self) -> List[Post]:
        stmt = (
            select(Post)
            .options(
                joinedload(Post.author),
                selectinload(Post.comments).joinedload(Comment.author),
                selectinload(Post.likes)
            )
            .order_by(desc(Post.created_at), desc(Post.id))
        )
        return list(self.db.scalars(stmt).unique().all())

    def get_following_feed(self, followed_ids: List[int]) -> List[Post]:
        if not followed_ids:
            return []
        stmt = (
            select(Post)
            .where(Post.author_id.in_(followed_ids))
            .options(
                joinedload(Post.author),
                selectinload(Post.comments).joinedload(Comment.author),
                selectinload(Post.likes)
            )
            .order_by(desc(Post.created_at), desc(Post.id))
        )
        return list(self.db.scalars(stmt).unique().all())

    def get_by_author_id(self, author_id: int) -> List[Post]:
        stmt = (
            select(Post)
            .where(Post.author_id == author_id)
            .options(
                joinedload(Post.author),
                selectinload(Post.comments).joinedload(Comment.author),
                selectinload(Post.likes)
            )
            .order_by(desc(Post.created_at), desc(Post.id))
        )
        return list(self.db.scalars(stmt).unique().all())

    def create(self, post: Post) -> Post:
        self.db.add(post)
        self.db.commit()
        self.db.refresh(post)
        return self.get_by_id(post.id)  # type: ignore

    def delete(self, post: Post) -> None:
        self.db.delete(post)
        self.db.commit()

    def count_all(self) -> int:
        return self.db.query(Post).count()

    def count_by_author(self, author_id: int) -> int:
        return self.db.query(Post).filter(Post.author_id == author_id).count()

    def count_by_user(self, user_id: int) -> int:
        return self.count_by_author(user_id)
