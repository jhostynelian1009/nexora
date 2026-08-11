# Ref: RF-013, RF-014, B-010
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.user import UserResponse

class AuthorSummary(BaseModel):
    id: int
    name: str
    career: str
    avatar_url: str | None = None

    model_config = ConfigDict(from_attributes=True)

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=500)

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("El comentario no puede estar vacío.")
        return stripped

class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    author: AuthorSummary

    model_config = ConfigDict(from_attributes=True)
