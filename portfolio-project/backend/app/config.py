"""
Application Configuration
Loads environment variables and provides type-safe configuration
"""
from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from pathlib import Path


ENV_FILE_PATH = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Yiğit Okur Portfolio API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str
    
    # Security & JWT
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days
    ADMIN_EMAILS: str = "yigitokur@ieee.org,admin@portfolio.com"

    # GitHub
    GITHUB_USERNAME: str = "TurkishKEBAB"
    GITHUB_API_TOKEN: Optional[str] = None
    GITHUB_CACHE_HOURS: int = 24

    # Email (SMTP)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str
    SMTP_PASSWORD: str

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: Optional[str] = None

    # Supabase Storage
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_BUCKET_NAME: str = "portfolio-files"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        """Returns list of allowed CORS origins"""
        # Always include common localhost variants to avoid CORS issues during dev
        origins = {
            self.FRONTEND_URL,
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:5173",
        }

        # Add production URLs if configured
        if self.ENVIRONMENT == "production":
            origins.update({
                "https://yigitokur.vercel.app",
                "https://www.yigitokur.com",  # If custom domain is added
            })

        return list(origins)

    @property
    def admin_email_list(self) -> List[str]:
        """Return admin emails as normalized list"""
        return [email.strip().lower() for email in self.ADMIN_EMAILS.split(",") if email.strip()]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # File Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB in bytes
    ALLOWED_EXTENSIONS: str = "jpg,jpeg,png,gif,webp,pdf"

    @property
    def ALLOWED_EXTENSIONS_LIST(self) -> List[str]:
        """Returns list of allowed file extensions"""
        return [ext.strip() for ext in self.ALLOWED_EXTENSIONS.split(",")]

    # Logging
    LOG_LEVEL: str = "INFO"

    # Model configuration
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.ENVIRONMENT == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.ENVIRONMENT == "production"


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    Using lru_cache ensures we only create one instance
    """
    return Settings()


# Create global settings instance
settings = get_settings()
