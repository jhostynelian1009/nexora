# Ref: RF2-013, RF2-014, B2-007
from pydantic import BaseModel, Field, field_validator

class PasswordResetRequest(BaseModel):
    email_or_phone: str = Field(..., min_length=3, max_length=160)

    @field_validator("email_or_phone")
    @classmethod
    def validate_input(cls, v: str) -> str:
        stripped = v.strip().lower()
        if not stripped:
            raise ValueError("El correo o teléfono no puede estar vacío.")
        return stripped

class PasswordResetVerify(BaseModel):
    email_or_phone: str = Field(..., min_length=3, max_length=160)
    otp_code: str = Field(..., min_length=6, max_length=6)

    @field_validator("otp_code")
    @classmethod
    def validate_otp(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 6:
            raise ValueError("El código OTP debe ser numérico de 6 dígitos.")
        return v

class PasswordResetConfirm(BaseModel):
    email_or_phone: str = Field(..., min_length=3, max_length=160)
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6, max_length=100)

    @field_validator("otp_code")
    @classmethod
    def validate_otp(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 6:
            raise ValueError("El código OTP debe ser numérico de 6 dígitos.")
        return v
