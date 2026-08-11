# Ref: RF-001, RF-002, RF-003, RF-004, B-003, B-004
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse
from app.repositories.user_repository import UserRepository
from app.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def register(self, data: UserRegister) -> TokenResponse:
        existing = self.user_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El correo ya se encuentra registrado."
            )

        hashed_pwd = get_password_hash(data.password)
        new_user = User(
            name=data.name,
            email=data.email,
            password_hash=hashed_pwd,
            career=data.career,
            bio="Aprendiendo y conectando en Nexora."
        )
        created_user = self.user_repo.create(new_user)
        access_token = create_access_token(subject=created_user.id)
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(created_user)
        )

    def login(self, data: UserLogin) -> TokenResponse:
        user = self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas."
            )

        access_token = create_access_token(subject=user.id)
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
