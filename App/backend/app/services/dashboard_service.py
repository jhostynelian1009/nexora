# Ref: RF-015, RF-016, B-015
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.dashboard import DashboardStatsResponse
from app.repositories.user_repository import UserRepository
from app.repositories.post_repository import PostRepository
from app.repositories.like_repository import LikeRepository
from app.repositories.comment_repository import CommentRepository

class DashboardService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
        self.post_repo = PostRepository(db)
        self.like_repo = LikeRepository(db)
        self.comment_repo = CommentRepository(db)

    def get_stats(self, current_user: User) -> DashboardStatsResponse:
        total_users = self.user_repo.count_all()
        total_posts = self.post_repo.count_all()
        total_likes = self.like_repo.count_all()
        total_comments = self.comment_repo.count_all()

        my_posts = self.post_repo.count_by_author(current_user.id)
        my_likes_received = self.like_repo.count_likes_received_by_user(current_user.id)

        return DashboardStatsResponse(
            users=total_users,
            posts=total_posts,
            likes=total_likes,
            comments=total_comments,
            my_posts=my_posts,
            my_likes_received=my_likes_received
        )
