# Ref: RNF-005, RNF-008, B-001
import os
from typing import List, Union
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Nexora API"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "mysql+pymysql://root:@127.0.0.1:3307/nexora"
    TEST_DATABASE_URL: str = "mysql+pymysql://root:@127.0.0.1:3307/nexora_test"
    SECRET_KEY: str = "nexora_super_secret_jwt_key_2026_dev"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173"

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
