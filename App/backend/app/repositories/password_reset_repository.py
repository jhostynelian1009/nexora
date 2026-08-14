# Ref: RF2-013, RF2-014, B2-007
from typing import Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.models.password_reset import PasswordResetCode
from app.core.config import settings

class PasswordResetRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_code(self, user_id: int, code_hash: str) -> PasswordResetCode:
        # Invalidate previous unused codes for user
        self.invalidate_user_codes(user_id)

        expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.PASSWORD_RESET_CODE_TTL_SECONDS)
        reset_code = PasswordResetCode(
            user_id=user_id,
            code_hash=code_hash,
            expires_at=expires_at,
            attempts=0
        )
        self.db.add(reset_code)
        self.db.commit()
        self.db.refresh(reset_code)
        return reset_code

    def get_latest_valid_code(self, user_id: int) -> Optional[PasswordResetCode]:
        now = datetime.now(timezone.utc)
        stmt = (
            select(PasswordResetCode)
            .where(
                PasswordResetCode.user_id == user_id,
                PasswordResetCode.used_at == None,
                PasswordResetCode.expires_at > now,
                PasswordResetCode.attempts < settings.PASSWORD_RESET_MAX_ATTEMPTS
            )
            .order_by(desc(PasswordResetCode.created_at))
        )
        return self.db.scalars(stmt).first()

    def increment_attempts(self, code: PasswordResetCode) -> None:
        code.attempts += 1
        self.db.commit()

    def mark_used(self, code: PasswordResetCode) -> None:
        code.used_at = datetime.now(timezone.utc)
        self.db.commit()

    def invalidate_user_codes(self, user_id: int) -> None:
        now = datetime.now(timezone.utc)
        codes = self.db.scalars(
            select(PasswordResetCode).where(
                PasswordResetCode.user_id == user_id,
                PasswordResetCode.used_at == None
            )
        ).all()
        for c in codes:
            c.used_at = now
        self.db.commit()
