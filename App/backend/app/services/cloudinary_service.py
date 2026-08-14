# Ref: RF2-007, RF2-008, B2-003, ADR2-001
import os
import io
import uuid
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import cloudinary
import cloudinary.uploader
from app.core.config import settings

class CloudinaryService:
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
    ALLOWED_MIMES = {"image/jpeg", "image/png", "image/webp"}
    MAX_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    @classmethod
    def _is_configured(cls) -> bool:
        return bool(
            settings.CLOUDINARY_CLOUD_NAME and
            settings.CLOUDINARY_API_KEY and
            settings.CLOUDINARY_API_SECRET and
            settings.CLOUDINARY_CLOUD_NAME.lower() not in ["placeholder", "dev_cloud", ""]
        )

    @classmethod
    def validate_file(cls, file: UploadFile, content: bytes) -> None:
        # Check pre-read size
        if len(content) > cls.MAX_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El archivo excede el tamaño máximo permitido de {settings.MAX_UPLOAD_SIZE_MB}MB."
            )

        # Check content-type header
        if file.content_type and file.content_type.lower() not in cls.ALLOWED_MIMES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato de archivo no soportado. Solo se permiten JPEG, PNG y WEBP."
            )

        # Check actual image content and format using Pillow
        try:
            image = Image.open(io.BytesIO(content))
            image.verify()
            if image.format.lower() not in ["jpeg", "png", "webp"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El archivo no es una imagen válida (JPEG, PNG o WEBP)."
                )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rechazado: El contenido enviado no corresponde a un archivo de imagen válido."
            )

    @classmethod
    def upload_image(cls, file: UploadFile, folder: str) -> Tuple[str, str]:
        # Read content
        content = file.file.read()
        cls.validate_file(file, content)

        # Generate unique server-side filename / public_id
        unique_filename = f"{uuid.uuid4().hex}"

        if not cls._is_configured():
            # Dev/Test Mock Fallback when real Cloudinary API keys are not provided
            mock_id = f"mock_{folder.replace('/', '_')}_{unique_filename}"
            mock_url = f"https://res.cloudinary.com/demo/image/upload/{folder}/{mock_id}.png"
            return mock_url, mock_id

        # Configure Cloudinary SDK
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )

        try:
            response = cloudinary.uploader.upload(
                content,
                folder=folder,
                public_id=unique_filename,
                resource_type="image"
            )
            secure_url = response.get("secure_url")
            public_id = response.get("public_id")
            if not secure_url or not public_id:
                raise Exception("Error al obtener la respuesta de Cloudinary")
            return secure_url, public_id
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al subir imagen a Cloudinary: {str(e)}"
            )

    @classmethod
    def delete_image(cls, public_id: Optional[str]) -> bool:
        if not public_id or public_id.startswith("mock_"):
            return True

        if not cls._is_configured():
            return True

        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )

        try:
            res = cloudinary.uploader.destroy(public_id, invalidate=True)
            return res.get("result") == "ok"
        except Exception as e:
            print(f"[Cloudinary Warning] Error deleting public_id {public_id}: {e}")
            return False
