# Ref: RF2-009, RF2-010, B2-004, B2-005
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.comment import AuthorSummary

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("El mensaje no puede estar vacío.")
        return stripped

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender: AuthorSummary
    content: str
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationResponse(BaseModel):
    id: int
    other_user: AuthorSummary
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
