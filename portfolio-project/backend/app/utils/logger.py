"""
Logging Configuration
Structured logging using loguru
"""
import os
import sys
from loguru import logger
from app.config import settings


def _safe_add_file_sink(path: str, **kwargs) -> bool:
    """Add a file sink when the target path is writable, otherwise keep console logging only."""
    try:
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        logger.add(path, **kwargs)
        return True
    except OSError as exc:
        logger.warning(f"Skipping file log sink '{path}': {exc}")
        return False


def setup_logging():
    """
    Configure application logging
    """
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    # Remove default handler
    logger.remove()
    
    # Add console handler with custom format
    logger.add(
        sys.stdout,
        colorize=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
               "<level>{level: <8}</level> | "
               "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
               "<level>{message}</level>",
        level=settings.LOG_LEVEL,
    )
    
    # Add file handler for errors when the runtime can write to the logs directory.
    _safe_add_file_sink(
        "logs/error.log",
        rotation="500 MB",
        retention="10 days",
        level="ERROR",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}",
    )
    
    # Add file handler for all logs in production
    if settings.is_production:
        _safe_add_file_sink(
            "logs/app.log",
            rotation="1 day",
            retention="30 days",
            level="INFO",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}",
        )
    
    logger.info(f"Logging configured with level: {settings.LOG_LEVEL}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

# Create logs directory if it doesn't exist
os.makedirs("logs", exist_ok=True)
