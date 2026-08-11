# Ref: RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013, RF-014, B-007, B-008, B-009, B-010
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.post import Post
from app.models.like import Like
from app.models.comment import Comment
from app.schemas.post import PostCreate, PostResponse
from app.schemas.comment import CommentCreate, CommentResponse, AuthorSummary
from app.schemas.like import LikeToggleResponse
from app.repositories.post_repository import PostRepository
from app.repositories.like_repository import LikeRepository
from app.repositories.comment_repository import CommentRepository

class PostService:
    def __init__(self, db: Session):
        self.db = db
        self.post_repo = PostRepository(db)
        self.like_repo = LikeRepository(db)
        self.comment_repo = CommentRepository(db)

    def create_post(self, current_user: User, data: PostCreate) -> PostResponse:
        new_post = Post(
            content=data.content,
            image_url=data.image_url,
            author_id=current_user.id
        )
        post = self.post_repo.create(new_post)
        return self._format_post_response(post, current_user.id)

    def get_feed(self, current_user: User) -> List[PostResponse]:
        posts = self.post_repo.get_feed()
        return [self._format_post_response(p, current_user.id) for p in posts]

    def delete_post(self, current_user: User, post_id: int) -> None:
        post = self.post_repo.get_by_id(post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publicación no encontrada."
            )
        if post.author_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para eliminar esta publicación."
            )
        self.post_repo.delete(post)

    def toggle_like(self, current_user: User, post_id: int) -> LikeToggleResponse:
        post = self.post_repo.get_by_id(post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publicación no encontrada."
            )

        existing = self.like_repo.get_like(user_id=current_user.id, post_id=post_id)
        if existing:
            self.like_repo.delete(existing)
            liked = False
        else:
            new_like = Like(user_id=current_user.id, post_id=post_id)
            self.like_repo.create(new_like)
            liked = True

        new_count = self.like_repo.count_by_post(post_id)
        return LikeToggleResponse(liked=liked, likes_count=new_count)

    def add_comment(self, current_user: User, post_id: int, data: CommentCreate) -> CommentResponse:
        post = self.post_repo.get_by_id(post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publicación no encontrada."
            )

        new_comment = Comment(
            content=data.content,
            author_id=current_user.id,
            post_id=post_id
        )
        created = self.comment_repo.create(new_comment)
        return CommentResponse(
            id=created.id,
            content=created.content,
            created_at=created.created_at,
            author=AuthorSummary(
                id=created.author.id,
                name=created.author.name,
                career=created.author.career,
                avatar_url=created.author.avatar_url
            )
        )

    def _format_post_response(self, post: Post, current_user_id: int) -> PostResponse:
        likes_count = len(post.likes) if post.likes is not None else 0
        liked_by_me = any(l.user_id == current_user_id for l in post.likes) if post.likes else False

        formatted_comments = []
        if post.comments:
            # Sort comments chronologically asc
            sorted_comments = sorted(post.comments, key=lambda c: c.created_at)
            formatted_comments = [
                CommentResponse(
                    id=c.id,
                    content=c.content,
                    created_at=c.created_at,
                    author=AuthorSummary(
                        id=c.author.id,
                        name=c.author.name,
                        career=c.author.career,
                        avatar_url=c.author.avatar_url
                    )
                )
                for c in sorted_comments
            ]

        return PostResponse(
            id=post.id,
            content=post.content,
            image_url=post.image_url,
            created_at=post.created_at,
            author=AuthorSummary(
                id=post.author.id,
                name=post.author.name,
                career=post.author.career,
                avatar_url=post.author.avatar_url
            ),
            likes_count=likes_count,
            liked_by_me=liked_by_me,
            comments=formatted_comments
        )
