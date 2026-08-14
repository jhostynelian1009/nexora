# Ref: RF2-001..RF2-005, B2-001, B2-002, B2-003, ADR2-001
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserSearchResponse, PublicUserProfile, UserSummary
from app.repositories.user_repository import UserRepository
from app.repositories.post_repository import PostRepository

class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.post_repo = PostRepository(db)

    def get_profile(self, user: User) -> UserResponse:
        return UserResponse.model_validate(user)

    def update_profile(self, current_user: User, data: UserUpdate) -> UserResponse:
        update_dict = data.model_dump(exclude_unset=True)
        if not update_dict:
            return UserResponse.model_validate(current_user)

        # Check unique email if updating email
        if "email" in update_dict and update_dict["email"] != current_user.email:
            existing = self.user_repo.get_by_email(update_dict["email"])
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El correo electrónico ya está registrado."
                )

        updated_user = self.user_repo.update_profile(current_user.id, update_dict)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        return UserResponse.model_validate(updated_user)

    def search_users(self, query: str, current_user: Optional[User] = None, limit: int = 20) -> List[UserSummary]:
        if not query or len(query.strip()) == 0:
            return []
        users = self.user_repo.search_users(query.strip(), limit)
        res = []
        for u in users:
            is_followed = False
            if current_user and current_user.id != u.id:
                is_followed = self.user_repo.is_following(current_user.id, u.id)
            res.append(
                UserSummary(
                    id=u.id,
                    name=u.name,
                    career=u.career,
                    avatar_url=u.avatar_url,
                    bio=u.bio,
                    is_followed_by_me=is_followed
                )
            )
        return res

    def get_public_profile(self, target_user_id: int, current_user: User) -> PublicUserProfile:
        target_user = self.user_repo.get_by_id(target_user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        followers_count = self.user_repo.count_followers(target_user_id)
        following_count = self.user_repo.count_following(target_user_id)
        posts_count = self.post_repo.count_by_user(target_user_id)

        is_following = False
        is_me = (current_user.id == target_user_id)
        if not is_me:
            is_following = self.user_repo.is_following(current_user.id, target_user_id)

        return PublicUserProfile(
            id=target_user.id,
            name=target_user.name,
            career=target_user.career,
            avatar_url=target_user.avatar_url,
            bio=target_user.bio,
            created_at=target_user.created_at,
            followers_count=followers_count,
            following_count=following_count,
            posts_count=posts_count,
            is_followed_by_me=is_following,
            is_me=is_me
        )

    def follow_user(self, target_user_id: int, current_user: User) -> dict:
        if target_user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes seguirte a ti mismo"
            )

        target_user = self.user_repo.get_by_id(target_user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        f = self.user_repo.follow(current_user.id, target_user_id)
        if f:
            # Trigger notification only on new follow creation
            from app.services.notification_service import NotificationService
            ns = NotificationService(self.db)
            ns.create_notification(
                recipient_id=target_user_id,
                actor_id=current_user.id,
                type="follow",
                entity_type="user",
                entity_id=current_user.id,
                payload={"message": f"{current_user.name} ha comenzado a seguirte."}
            )

        followers_count = self.user_repo.count_followers(target_user_id)
        return {"following": True, "followers_count": followers_count}

    def unfollow_user(self, target_user_id: int, current_user: User) -> dict:
        if target_user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes dejar de seguirte a ti mismo"
            )

        target_user = self.user_repo.get_by_id(target_user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        self.user_repo.unfollow(current_user.id, target_user_id)
        followers_count = self.user_repo.count_followers(target_user_id)
        return {"following": False, "followers_count": followers_count}

    def get_followers(self, target_user_id: int, current_user: User) -> List[UserSummary]:
        target_user = self.user_repo.get_by_id(target_user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        followers = self.user_repo.get_followers(target_user_id)
        return [
            UserSummary(
                id=u.id,
                name=u.name,
                career=u.career,
                avatar_url=u.avatar_url,
                bio=u.bio,
                is_followed_by_me=self.user_repo.is_following(current_user.id, u.id)
            )
            for u in followers
        ]

    def get_following(self, target_user_id: int, current_user: User) -> List[UserSummary]:
        target_user = self.user_repo.get_by_id(target_user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        following = self.user_repo.get_following(target_user_id)
        return [
            UserSummary(
                id=u.id,
                name=u.name,
                career=u.career,
                avatar_url=u.avatar_url,
                bio=u.bio,
                is_followed_by_me=self.user_repo.is_following(current_user.id, u.id)
            )
            for u in following
        ]
