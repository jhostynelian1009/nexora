# Ref: RNF-005, RNF-008, B-001, B2-003, B2-007, RNF2-004, B2-011
import os
from typing import List, Union
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Nexora API"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "mysql+pymysql://root:@127.0.0.1:3307/nexora"
    TEST_DATABASE_URL: str = "mysql+pymysql://root:@127.0.0.1:3307/nexora_test"
    SECRET_KEY: str = "nexora_super_secret_jwt_key_2026_dev_environment_key_at_least_64_bytes_long"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173"

    # Cloudinary configuration
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    MAX_UPLOAD_SIZE_MB: int = 5

    # Password Reset & Pepper Security
    PASSWORD_RESET_PROVIDER: str = "development"  # development | whatsapp
    WHATSAPP_PROVIDER: str = "console"             # console | meta
    OTP_HMAC_PEPPER: str = "dev-otp-hmac-pepper-secret-key-nexora-v2-32bytes"
    PASSWORD_RESET_CODE_TTL_SECONDS: int = 300
    PASSWORD_RESET_MAX_ATTEMPTS: int = 5

    # Meta WhatsApp Business Credentials
    WHATSAPP_API_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_TEMPLATE_NAME: str = "password_reset_otp"

    # Rate Limiting Configuration
    RATE_LIMIT_PER_MINUTE_GLOBAL: int = 100
    RATE_LIMIT_PER_MINUTE_AUTH: int = 10
    RATE_LIMIT_PER_MINUTE_RESET: int = 5

    # WS Ticket TTL
    WS_TICKET_TTL_SECONDS: int = 60

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        if self.ENVIRONMENT.lower() == "production":
            placeholders = ["secret", "change-in-production", "dev", "placeholder", "12345"]
            sec_lower = self.SECRET_KEY.lower()
            has_placeholder = any(p in sec_lower for p in placeholders)
            if has_placeholder or len(self.SECRET_KEY) < 64:
                raise ValueError(
                    "SECURITY GUARD ERROR: In production environment, SECRET_KEY must not use "
                    "placeholder values and MUST be at least 64 characters long."
                )

            # Validate OTP HMAC Pepper
            pepper_lower = self.OTP_HMAC_PEPPER.lower()
            if not self.OTP_HMAC_PEPPER or len(self.OTP_HMAC_PEPPER) < 32 or any(p in pepper_lower for p in placeholders):
                raise ValueError(
                    "SECURITY GUARD ERROR: In production environment, OTP_HMAC_PEPPER must not use "
                    "placeholder values and MUST be at least 32 characters long."
                )

            # Prohibit dev reset providers
            if self.PASSWORD_RESET_PROVIDER.lower() in ["development", "dev"] or self.WHATSAPP_PROVIDER.lower() == "console":
                raise ValueError(
                    "SECURITY GUARD ERROR: PASSWORD_RESET_PROVIDER=development or WHATSAPP_PROVIDER=console is prohibited in production."
                )

            # Cloudinary guard
            if not self.CLOUDINARY_CLOUD_NAME or not self.CLOUDINARY_API_KEY or not self.CLOUDINARY_API_SECRET:
                raise ValueError(
                    "SECURITY GUARD ERROR: Cloudinary credentials (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET) are required in production."
                )
        return self

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
