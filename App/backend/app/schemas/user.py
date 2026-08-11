# Ref: RF-001, RF-003, RF-004, RF-006, B-003, B-004, B-006
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    career: str = Field(..., min_length=1, max_length=120)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("name", "career")
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("El campo no puede estar vacío.")
        return stripped

class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    career: str
    bio: str
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=80)
    career: Optional[str] = Field(None, min_length=1, max_length=120)
    bio: Optional[str] = Field(None, max_length=240)
    avatar_url: Optional[str] = Field(None, max_length=500)

    @field_validator("name", "career", "bio")
    @classmethod
    def validate_not_empty_if_provided(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            if not stripped:
                raise ValueError("El campo no puede estar vacío.")
            return stripped
        return v

    @field_validator("avatar_url")
    @classmethod
    def validate_avatar_url(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip() != "":
            stripped = v.strip()
            if not (stripped.startswith("http://") or stripped.startswith("https://")):
                raise ValueError("La URL del avatar debe comenzar con http:// o https://")
            return stripped
        return None
