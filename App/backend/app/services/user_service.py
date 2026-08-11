# Ref: RF-004, RF-006, B-005, B-006
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse
from app.repositories.user_repository import UserRepository

class UserService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def get_profile(self, user: User) -> UserResponse:
        return UserResponse.model_validate(user)

    def update_profile(self, user: User, data: UserUpdate) -> UserResponse:
        if data.name is not None:
            user.name = data.name
        if data.career is not None:
            user.career = data.career
        if data.bio is not None:
            user.bio = data.bio
        if data.avatar_url is not None:
            user.avatar_url = data.avatar_url

        updated = self.user_repo.update(user)
        return UserResponse.model_validate(updated)
