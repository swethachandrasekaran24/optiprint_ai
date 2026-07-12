import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "OptiPrint AI"
    API_V1_STR: str = "/api"
    DEBUG: bool = True

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "optiprint_ai"

    # Security & Auth
    JWT_SECRET_KEY: str = "947c945b6db76092025ebae54ef861c83fc6e48da25df5d098e980f772ba65c2"
    JWT_REFRESH_SECRET_KEY: str = "a7a00f2878c5fb43a0889dbd16bf784bc13b0c36b6f7902cd962eb020ad613e5"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    ALGORITHM: str = "HS256"

    # Upload Settings
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 50

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate settings
settings = Settings()
