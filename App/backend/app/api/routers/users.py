# Ref: RF-006, B-006
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["Usuarios"])

@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def update_user_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = UserService(db)
    return service.update_profile(current_user, data)
