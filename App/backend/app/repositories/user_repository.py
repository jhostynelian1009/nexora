# Ref: RF-001, RF-002, RF-003, RF-004, RF-006, B-002, B-003, B-006, RF2-001, RF2-003, RF2-004, B2-002
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, delete, func
from app.models.user import User
from app.models.follow import Follow

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.get(User, user_id)

    def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email.strip().lower())
        return self.db.scalars(stmt).first()

    def get_by_phone(self, phone: str) -> Optional[User]:
        if not phone or not phone.strip():
            return None
        stmt = select(User).where(User.phone == phone.strip())
        return self.db.scalars(stmt).first()

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_profile(self, user_id: int, update_dict: dict) -> Optional[User]:
        user = self.get_by_id(user_id)
        if not user:
            return None
        for key, val in update_dict.items():
            if hasattr(user, key):
                setattr(user, key, val)
        self.db.commit()
        self.db.refresh(user)
        return user

    def count_all(self) -> int:
        return self.db.query(User).count()

    def search(self, query: str, limit: int = 20) -> List[User]:
        q_clean = f"%{query.strip()}%"
        stmt = select(User).where(
            or_(
                User.name.ilike(q_clean),
                User.career.ilike(q_clean)
            )
        ).limit(limit)
        return list(self.db.scalars(stmt).all())

    def search_users(self, query: str, limit: int = 20) -> List[User]:
        return self.search(query, limit)

    def is_following(self, follower_id: int, followed_id: int) -> bool:
        stmt = select(Follow).where(
            Follow.follower_id == follower_id,
            Follow.followed_id == followed_id
        )
        return self.db.scalars(stmt).first() is not None

    def follow(self, follower_id: int, followed_id: int) -> Optional[Follow]:
        if follower_id == followed_id:
            return None
        if self.is_following(follower_id, followed_id):
            return None
        f = Follow(follower_id=follower_id, followed_id=followed_id)
        self.db.add(f)
        self.db.commit()
        self.db.refresh(f)
        return f

    def unfollow(self, follower_id: int, followed_id: int) -> bool:
        stmt = delete(Follow).where(
            Follow.follower_id == follower_id,
            Follow.followed_id == followed_id
        )
        res = self.db.execute(stmt)
        self.db.commit()
        return res.rowcount > 0

    def count_followers(self, user_id: int) -> int:
        stmt = select(func.count()).select_from(Follow).where(Follow.followed_id == user_id)
        return self.db.scalar(stmt) or 0

    def count_following(self, user_id: int) -> int:
        stmt = select(func.count()).select_from(Follow).where(Follow.follower_id == user_id)
        return self.db.scalar(stmt) or 0

    def get_followers(self, user_id: int) -> List[User]:
        stmt = select(User).join(Follow, Follow.follower_id == User.id).where(Follow.followed_id == user_id)
        return list(self.db.scalars(stmt).all())

    def get_following(self, user_id: int) -> List[User]:
        stmt = select(User).join(Follow, Follow.followed_id == User.id).where(Follow.follower_id == user_id)
        return list(self.db.scalars(stmt).all())

    def get_followed_user_ids(self, follower_id: int) -> List[int]:
        stmt = select(Follow.followed_id).where(Follow.follower_id == follower_id)
        return list(self.db.scalars(stmt).all())
