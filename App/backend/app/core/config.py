# Ref: RNF-005, RNF-008, B-001
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union

class Settings(BaseSettings):
    APP_NAME: str = "Nexora API"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "mysql+pymysql://root:@127.0.0.1:3307/nexora"
    SECRET_KEY: str = "nexora_super_secret_jwt_key_2026_dev"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173"

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
