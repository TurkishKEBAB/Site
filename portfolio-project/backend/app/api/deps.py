"""
API Dependencies
Authentication and database dependencies
"""
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from sqlalchemy.orm import Session
import uuid
from loguru import logger

from app.database import get_db as db_session
from app.config import get_settings
from app.models.user import User
from app.crud import user as user_crud
from app.crud import token as token_crud

# Security scheme
security = HTTPBearer()
settings = get_settings()


# Database dependency (re-export for convenience)
def get_db() -> Generator[Session, None, None]:
    """Get database session"""
    yield from db_session()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer credentials
        db: Database session
        
    Returns:
        Authenticated user object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id_str: str = payload.get("sub")
        token_type: str = payload.get("type", "access")
        token_jti: str | None = payload.get("jti")

        if user_id_str is None:
            raise credentials_exception
        if token_type != "access":
            raise credentials_exception

        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            raise credentials_exception
            
    except jwt.PyJWTError:
        raise credentials_exception

    if token_crud.is_token_blacklisted(db, token_jti):
        raise credentials_exception

    user = user_crud.get_user_by_id(db, user_id=user_id)
    
    if user is None:
        raise credentials_exception
    
    return user


def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Require admin role for endpoint access
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Admin user object
        
    Raises:
        HTTPException: If user is not an admin
    """
    admin_emails = set(settings.admin_email_list)
    user_email = getattr(current_user, "email", "").lower()

    # Debug logging
    logger.debug(f"Admin check - User email: '{user_email}'")
    logger.debug(f"Admin emails list: {admin_emails}")
    logger.debug(f"Is admin: {user_email in admin_emails}")

    if not admin_emails:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server misconfiguration: ADMIN_EMAILS not set"
        )

    if user_email not in admin_emails:
        logger.warning(f"Admin access denied for user: {user_email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin access required."
        )
    
    logger.info(f"Admin access granted for user: {user_email}")
    return current_user


# Optional authentication (for endpoints that work with or without auth)
def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> User | None:
    """
    Get current user if authenticated, otherwise None
    Used for endpoints that work both authenticated and unauthenticated
    
    Args:
        credentials: Optional HTTP Bearer credentials
        db: Database session
        
    Returns:
        User object if authenticated, None otherwise
    """
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id_str: str = payload.get("sub")
        token_type: str = payload.get("type", "access")
        token_jti: str | None = payload.get("jti")

        if user_id_str is None:
            return None
        if token_type != "access":
            return None

        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            return None

    except jwt.PyJWTError:
        return None

    if token_crud.is_token_blacklisted(db, token_jti):
        return None

    user = user_crud.get_user_by_id(db, user_id=user_id)
    return user
