# Ref: RF2-013, RF2-014, B2-007
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.password_reset import PasswordResetRequest, PasswordResetVerify, PasswordResetConfirm
from app.services.password_reset_service import PasswordResetService

router = APIRouter(prefix="/api/auth/password-reset", tags=["Recuperación de Contraseña"])

@router.post("/request", status_code=status.HTTP_200_OK)
def request_password_reset(
    data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    service = PasswordResetService(db)
    return service.request_reset(data.email_or_phone)

@router.post("/verify", status_code=status.HTTP_200_OK)
def verify_password_reset(
    data: PasswordResetVerify,
    db: Session = Depends(get_db)
):
    service = PasswordResetService(db)
    return service.verify_reset(data.email_or_phone, data.otp_code)

@router.post("/confirm", status_code=status.HTTP_200_OK)
def confirm_password_reset(
    data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    service = PasswordResetService(db)
    return service.confirm_reset(data.email_or_phone, data.otp_code, data.new_password)
