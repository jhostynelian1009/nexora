# Ref: RF2-007, RF2-008, B2-003, ADR2-001
from fastapi import APIRouter, Depends, status, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.services.cloudinary_service import CloudinaryService
from app.services.user_service import UserService

router = APIRouter(prefix="/api/uploads", tags=["Subida de Archivos"])

@router.post("/avatar", status_code=status.HTTP_200_OK)
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Upload new image first
    secure_url, public_id = CloudinaryService.upload_image(file, folder="nexora/avatars")

    # Store old public_id for deletion after MySQL update succeeds
    old_public_id = current_user.avatar_public_id

    try:
        current_user.avatar_url = secure_url
        current_user.avatar_public_id = public_id
        db.commit()
        db.refresh(current_user)
    except Exception:
        db.rollback()
        # Clean up newly uploaded Cloudinary image if DB commit fails
        CloudinaryService.delete_image(public_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al actualizar usuario en base de datos. La imagen subida fue descartada."
        )

    # Delete old Cloudinary avatar ONLY after successful DB commit
    if old_public_id and old_public_id != public_id:
        CloudinaryService.delete_image(old_public_id)

    return {
        "secure_url": secure_url,
        "public_id": public_id
    }

@router.post("/post-image", status_code=status.HTTP_200_OK)
def upload_post_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    secure_url, public_id = CloudinaryService.upload_image(file, folder="nexora/posts")
    return {
        "secure_url": secure_url,
        "public_id": public_id
    }
