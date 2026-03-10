"""
Authentication Endpoints
Login and user management
"""
from datetime import datetime, timedelta, timezone
from typing import Annotated
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.api.deps import get_db, get_current_user, require_admin
from app.config import get_settings
from app.schemas.user import UserLogin, UserCreate, UserResponse, Token, RefreshTokenRequest
from app.crud import user as user_crud
from app.crud import token as token_crud
from app.core.rate_limit import limiter
from app.utils.security import create_access_token, create_refresh_token

router = APIRouter()
settings = get_settings()


def _issue_token_pair(
    db: Session,
    *,
    user_id: uuid.UUID,
    request: Request,
) -> tuple[dict, str]:
    access_expires_minutes = settings.access_token_expire_minutes
    refresh_expires_days = settings.REFRESH_TOKEN_EXPIRE_DAYS
    access_jti = str(uuid.uuid4())
    refresh_jti = str(uuid.uuid4())

    access_token = create_access_token(
        data={"sub": str(user_id), "jti": access_jti, "type": "access"},
        expires_delta=timedelta(minutes=access_expires_minutes),
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user_id), "jti": refresh_jti, "type": "refresh"},
        expires_delta=timedelta(days=refresh_expires_days),
    )

    refresh_expires_at = datetime.now(timezone.utc) + timedelta(days=refresh_expires_days)
    token_crud.create_refresh_token_session(
        db,
        user_id=user_id,
        token_jti=refresh_jti,
        expires_at=refresh_expires_at,
        created_from_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return (
        {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": access_expires_minutes * 60,
            "refresh_expires_in": refresh_expires_days * 24 * 60 * 60,
        },
        refresh_jti,
    )


@router.post("/login", response_model=Token)
@limiter.limit(settings.AUTH_LOGIN_RATE_LIMIT)
async def login(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = user_crud.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    user_crud.update_last_login(db, user.id)

    tokens, _ = _issue_token_pair(db, user_id=user.id, request=request)
    return tokens


@router.post("/login/json", response_model=Token)
@limiter.limit(settings.AUTH_LOGIN_RATE_LIMIT)
async def login_json(
    request: Request,
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    JSON-based login endpoint (alternative to OAuth2 form)
    """
    user = user_crud.authenticate_user(db, credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Update last login
    user_crud.update_last_login(db, user.id)

    tokens, _ = _issue_token_pair(db, user_id=user.id, request=request)
    return tokens


@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user = Depends(get_current_user)
):
    """
    Get current authenticated user information
    """
    return current_user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)  # Only admins can create users
):
    """
    Register a new user (admin only)
    """
    # Check if user already exists
    existing_user = user_crud.get_user_by_email(db, user_data.email)
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = user_crud.create_user(db, user_data)
    
    return user


@router.post("/verify-token")
async def verify_token(
    current_user = Depends(get_current_user)
):
    """
    Verify if the current token is valid
    Returns user information if valid
    """
    return {
        "valid": True,
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": getattr(current_user, "username", current_user.email),
            "is_admin": current_user.email.lower() in set(settings.admin_email_list),
        }
    }


@router.post("/refresh", response_model=Token)
@limiter.limit(settings.AUTH_LOGIN_RATE_LIMIT)
async def refresh_token(
    request: Request,
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Rotate refresh token and return a new token pair.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        decoded = jwt.decode(
            payload.refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        token_type = decoded.get("type")
        user_id_str = decoded.get("sub")
        token_jti = decoded.get("jti")
        token_exp = decoded.get("exp")

        if token_type != "refresh" or not user_id_str or not token_jti:
            raise credentials_exception
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    if token_crud.is_token_blacklisted(db, token_jti):
        raise credentials_exception

    if not token_crud.is_refresh_token_session_active(db, token_jti=token_jti, user_id=user_id):
        raise credentials_exception

    user = user_crud.get_user_by_id(db, user_id=user_id)
    if not user or not user.is_active:
        raise credentials_exception

    tokens, new_refresh_jti = _issue_token_pair(db, user_id=user.id, request=request)

    token_crud.revoke_refresh_token_session(
        db,
        token_jti=token_jti,
        replaced_by_jti=new_refresh_jti,
    )
    expires_at = (
        datetime.fromtimestamp(token_exp, tz=timezone.utc)
        if isinstance(token_exp, (int, float))
        else None
    )
    token_crud.blacklist_token(
        db,
        token_jti=token_jti,
        token_type="refresh",
        expires_at=expires_at,
        reason="rotated",
    )
    user_crud.update_last_login(db, user.id)
    return tokens
