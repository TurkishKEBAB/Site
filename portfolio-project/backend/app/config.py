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
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 8000
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str
    
    # Security & JWT
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: Optional[int] = None
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14
    JWT_EXPIRE_MINUTES: int = 15  # backward compatibility alias
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
    CORS_EXTRA_ORIGINS: str = ""

    # Auth / Abuse protection
    AUTH_LOGIN_RATE_LIMIT: str = "5/minute"
    CONTACT_RATE_LIMIT: str = "5/minute"

    # CAPTCHA
    CAPTCHA_ENABLED: bool = False
    CAPTCHA_PROVIDER: str = "turnstile"
    CAPTCHA_SECRET_KEY: Optional[str] = None
    CAPTCHA_VERIFY_URL: Optional[str] = None
    CAPTCHA_REQUIRED_PATHS: str = "/api/v1/contact/"

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        """Returns list of allowed CORS origins"""
        if self.is_production:
            origins = {self.FRONTEND_URL}
            extra_origins = [origin.strip() for origin in self.CORS_EXTRA_ORIGINS.split(",") if origin.strip()]
            origins.update(extra_origins)
        else:
            origins = {
                self.FRONTEND_URL,
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001",
                "http://127.0.0.1:5173",
            }

        return list(origins)

    @property
    def admin_email_list(self) -> List[str]:
        """Return admin emails as normalized list"""
        return [email.strip().lower() for email in self.ADMIN_EMAILS.split(",") if email.strip()]

    @property
    def access_token_expire_minutes(self) -> int:
        if self.ACCESS_TOKEN_EXPIRE_MINUTES and self.ACCESS_TOKEN_EXPIRE_MINUTES > 0:
            return self.ACCESS_TOKEN_EXPIRE_MINUTES
        return self.JWT_EXPIRE_MINUTES

    @property
    def captcha_verify_url(self) -> str:
        """Resolve CAPTCHA verification endpoint by provider."""
        if self.CAPTCHA_VERIFY_URL:
            return self.CAPTCHA_VERIFY_URL

        provider = self.CAPTCHA_PROVIDER.strip().lower()
        if provider == "hcaptcha":
            return "https://hcaptcha.com/siteverify"
        if provider == "recaptcha":
            return "https://www.google.com/recaptcha/api/siteverify"
        return "https://challenges.cloudflare.com/turnstile/v0/siteverify"

    @property
    def captcha_required_paths(self) -> List[str]:
        return [path.strip() for path in self.CAPTCHA_REQUIRED_PATHS.split(",") if path.strip()]

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

    def production_validation_errors(self) -> List[str]:
        """Return configuration validation errors for production mode."""
        if not self.is_production:
            return []

        errors: List[str] = []
        frontend_url = self.FRONTEND_URL.lower()
        if "localhost" in frontend_url or "127.0.0.1" in frontend_url:
            errors.append("FRONTEND_URL cannot point to localhost in production.")
        if len(self.SECRET_KEY.strip()) < 32:
            errors.append("SECRET_KEY must be at least 32 characters in production.")
        if not self.CAPTCHA_ENABLED:
            errors.append("CAPTCHA_ENABLED must be true in production.")
        if not self.CAPTCHA_SECRET_KEY:
            errors.append("CAPTCHA_SECRET_KEY must be set in production.")
        return errors


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    Using lru_cache ensures we only create one instance
    """
    return Settings()


# Create global settings instance
settings = get_settings()
