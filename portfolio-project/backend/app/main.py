"""
FastAPI Main Application
Yiğit Okur Portfolio API
"""
from contextlib import asynccontextmanager
import time
import uuid

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from slowapi.errors import RateLimitExceeded
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.core.errors import (
    ApiError,
    api_error_handler,
    general_exception_handler,
    http_exception_handler,
    rate_limit_exception_handler,
    validation_exception_handler,
)
from app.core.rate_limit import limiter
from app.database import check_db_connection
from app.schemas.error import ErrorResponse
from app.services.cache_service import get_cache_service
from app.services.observability import init_observability
from app.utils.logger import setup_logging

# Import API routes
from app.api.v1 import api_router


# Setup logging
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events
    Startup and shutdown logic
    """
    # Startup
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    production_errors = settings.production_validation_errors()
    if production_errors:
        for issue in production_errors:
            logger.error("Production configuration error: {}", issue)
        raise RuntimeError("Invalid production configuration")

    init_observability()
    
    # Check database connection
    if check_db_connection():
        logger.info("✓ Database connection successful")
    else:
        logger.error("✗ Database connection failed")
    
    # Initialize Redis cache
    cache_service = get_cache_service()
    await cache_service.connect()
    
    logger.info("🚀 Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    await cache_service.disconnect()
    logger.info("👋 Application shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for Yiğit Okur's professional portfolio",
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    lifespan=lifespan,
    responses={
        400: {"model": ErrorResponse, "description": "Bad request"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        429: {"model": ErrorResponse, "description": "Rate limited"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)

app.state.limiter = limiter
app.add_exception_handler(ApiError, api_error_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(RateLimitExceeded, rate_limit_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    start_time = time.time()
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = time.time() - start_time
    
    # Log request
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    # Add custom header
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Request-ID"] = request_id
    
    return response

# Health check endpoint
@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint for monitoring
    """
    db_status = check_db_connection()
    cache_service = get_cache_service()
    cache_status = cache_service.redis_client is not None
    
    return {
        "status": "healthy" if db_status else "degraded",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "services": {
            "database": "connected" if db_status else "disconnected",
            "cache": "connected" if cache_status else "disconnected"
        }
    }


@app.get("/live", tags=["System"])
async def liveness_check():
    """
    Liveness probe: process is running.
    """
    return {
        "status": "alive",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/ready", tags=["System"])
async def readiness_check():
    """
    Readiness probe: critical dependencies are available.
    Returns 503 when database is unavailable.
    """
    db_status = check_db_connection()
    cache_service = get_cache_service()
    cache_status = cache_service.redis_client is not None

    payload = {
        "status": "ready" if db_status else "not_ready",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "services": {
            "database": "connected" if db_status else "disconnected",
            "cache": "connected" if cache_status else "disconnected",
        },
    }
    if db_status:
        return payload
    return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=payload)


# Root endpoint
@app.get("/", tags=["System"])
async def root():
    """
    API root endpoint
    """
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "author": "Yiğit Okur",
        "email": "yigitokur@ieee.org",
        "documentation": "/docs" if settings.is_development else "https://api.yigitokur.com/docs",
        "github": "https://github.com/TurkishKEBAB"
    }


# Include API routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.is_development,
        log_level=settings.LOG_LEVEL.lower()
    )
