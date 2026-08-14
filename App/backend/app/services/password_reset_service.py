# Ref: RF2-013, RF2-014, B2-007, ADR2-002
import hmac
import secrets
import hashlib
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.repositories.password_reset_repository import PasswordResetRepository
from app.services.password_reset_provider import get_password_reset_sender
from app.core.security import get_password_hash
from app.core.config import settings

class PasswordResetService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.reset_repo = PasswordResetRepository(db)

    def _hash_otp(self, otp_code: str) -> str:
        """Computes HMAC-SHA256 using the configured secret pepper key."""
        pepper = settings.OTP_HMAC_PEPPER.encode("utf-8")
        return hmac.new(pepper, otp_code.encode("utf-8"), hashlib.sha256).hexdigest()

    def _verify_hash(self, raw_otp: str, stored_hash: str) -> bool:
        """Constant-time HMAC-SHA256 digest comparison."""
        computed_hash = self._hash_otp(raw_otp)
        return hmac.compare_digest(stored_hash, computed_hash)

    def request_reset(self, email_or_phone: str) -> dict:
        generic_msg = "Si la cuenta existe y la información es correcta, se ha enviado un código de recuperación."

        user = self.user_repo.get_by_email(email_or_phone)
        if not user and hasattr(self.user_repo, "get_by_phone"):
            user = self.user_repo.get_by_phone(email_or_phone)  # type: ignore

        if not user:
            # Anti-enumeration generic response
            return {"message": generic_msg}

        # Generate cryptographically secure 6-digit OTP
        raw_otp = f"{secrets.randbelow(1000000):06d}"
        code_hash = self._hash_otp(raw_otp)

        # Invalidate previous codes and issue a single active OTP for user
        self.reset_repo.create_code(user.id, code_hash)

        # Dispatch via configured provider strategy
        sender = get_password_reset_sender()
        sender.send_otp(user.phone or user.email, raw_otp)

        return {"message": generic_msg}

    def verify_reset(self, email_or_phone: str, otp_code: str) -> dict:
        generic_error = "Código OTP inválido, expirado o número máximo de intentos excedido."

        user = self.user_repo.get_by_email(email_or_phone)
        if not user and hasattr(self.user_repo, "get_by_phone"):
            user = self.user_repo.get_by_phone(email_or_phone)  # type: ignore

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=generic_error
            )

        valid_code = self.reset_repo.get_latest_valid_code(user.id)
        if not valid_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=generic_error
            )

        # Constant-time comparison
        if not self._verify_hash(otp_code, valid_code.code_hash):
            self.reset_repo.increment_attempts(valid_code)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=generic_error
            )

        return {"valid": True, "message": "Código OTP verificado correctamente."}

    def confirm_reset(self, email_or_phone: str, otp_code: str, new_password: str) -> dict:
        generic_error = "Código OTP inválido, expirado o número máximo de intentos excedido."

        user = self.user_repo.get_by_email(email_or_phone)
        if not user and hasattr(self.user_repo, "get_by_phone"):
            user = self.user_repo.get_by_phone(email_or_phone)  # type: ignore

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=generic_error
            )

        valid_code = self.reset_repo.get_latest_valid_code(user.id)
        if not valid_code or not self._verify_hash(otp_code, valid_code.code_hash):
            if valid_code:
                self.reset_repo.increment_attempts(valid_code)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=generic_error
            )

        # Update user password
        user.password_hash = get_password_hash(new_password)
        self.user_repo.update(user)

        # Atomic consumption: Mark OTP used and invalidate any remaining
        self.reset_repo.mark_used(valid_code)
        self.reset_repo.invalidate_user_codes(user.id)

        return {"message": "Contraseña actualizada exitosamente."}
