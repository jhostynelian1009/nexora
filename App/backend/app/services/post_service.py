# Ref: RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013, RF-014, B-007, B-008, B-009, B-010, RF2-003, RF2-006, RF2-008, RF2-012, B2-002, B2-003, B2-006
from typing import List, Optional
from fastapi import HTTPException, status, UploadFile
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
from app.repositories.user_repository import UserRepository
from app.services.cloudinary_service import CloudinaryService

class PostService:
    def __init__(self, db: Session):
        self.db = db
        self.post_repo = PostRepository(db)
        self.like_repo = LikeRepository(db)
        self.comment_repo = CommentRepository(db)
        self.user_repo = UserRepository(db)

    def create_post(self, current_user: User, data: PostCreate) -> PostResponse:
        new_post = Post(
            content=data.content,
            image_url=data.image_url,
            image_public_id=data.image_public_id,
            author_id=current_user.id
        )
        post = self.post_repo.create(new_post)
        return self._format_post_response(post, current_user.id)

    def create_post_with_image(self, current_user: User, content: str, file: UploadFile) -> PostResponse:
        """Atomic upload to Cloudinary and post creation in DB. Rollbacks Cloudinary on DB failure. (Task 28)"""
        if not content or not content.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El contenido de la publicación no puede estar vacío."
            )

        image_url, image_public_id = CloudinaryService.upload_image(file, folder="nexora/posts")

        try:
            new_post = Post(
                content=content.strip(),
                image_url=image_url,
                image_public_id=image_public_id,
                author_id=current_user.id
            )
            post = self.post_repo.create(new_post)
            return self._format_post_response(post, current_user.id)
        except Exception as e:
            # If DB insert fails, delete uploaded Cloudinary image (Task 28)
            if image_public_id:
                try:
                    CloudinaryService.delete_image(image_public_id)
                except Exception:
                    pass
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al guardar la publicación en la base de datos: {str(e)}"
            )

    def get_feed(self, current_user: User, scope: str = "all") -> List[PostResponse]:
        if scope == "following":
            followed_ids = self.user_repo.get_followed_user_ids(current_user.id)
            posts = self.post_repo.get_following_feed(followed_ids)
        else:
            posts = self.post_repo.get_feed()
        return [self._format_post_response(p, current_user.id) for p in posts]

    def get_user_posts(self, target_user_id: int, current_user: User) -> List[PostResponse]:
        target_user = self.user_repo.get_by_id(target_user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado."
            )
        posts = self.post_repo.get_by_author_id(target_user_id)
        return [self._format_post_response(p, current_user.id) for p in posts]

    def delete_post(self, current_user: User, post_id: int) -> None:
        """Deletes post from MySQL DB FIRST, then attempts Cloudinary image cleanup. (Task 31)"""
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

        image_public_id = post.image_public_id

        # 1. Commit DB deletion first
        self.post_repo.delete(post)

        # 2. Cleanup Cloudinary image after DB deletion
        if image_public_id:
            try:
                CloudinaryService.delete_image(image_public_id)
            except Exception:
                pass

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

            # Trigger notification if liked and not self-like
            if post.author_id != current_user.id:
                from app.services.notification_service import NotificationService
                ns = NotificationService(self.db)
                ns.create_notification(
                    recipient_id=post.author_id,
                    actor_id=current_user.id,
                    type="like",
                    entity_type="post",
                    entity_id=post.id,
                    payload={"message": f"A {current_user.name} le gusta tu publicación."}
                )

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

        # Trigger notification if not self-comment
        if post.author_id != current_user.id:
            from app.services.notification_service import NotificationService
            ns = NotificationService(self.db)
            ns.create_notification(
                recipient_id=post.author_id,
                actor_id=current_user.id,
                type="comment",
                entity_type="post",
                entity_id=post.id,
                payload={"message": f"{current_user.name} comentó en tu publicación: '{data.content[:30]}...'"}
            )

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
            image_public_id=post.image_public_id,
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
