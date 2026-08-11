# Ref: RF-007, RF-008, RF-009, RF-010, B-007, B-008
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.comment import AuthorSummary, CommentResponse

class PostCreate(BaseModel):
    content: str = Field(..., min_length=1)
    image_url: Optional[str] = Field(None, max_length=500)

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("El contenido de la publicación no puede estar vacío.")
        return stripped

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip() != "":
            stripped = v.strip()
            if not (stripped.startswith("http://") or stripped.startswith("https://")):
                raise ValueError("La URL de la imagen debe comenzar con http:// o https://")
            return stripped
        return None

class PostResponse(BaseModel):
    id: int
    content: str
    image_url: Optional[str] = None
    created_at: datetime
    author: AuthorSummary
    likes_count: int = 0
    liked_by_me: bool = False
    comments: List[CommentResponse] = []

    model_config = ConfigDict(from_attributes=True)
