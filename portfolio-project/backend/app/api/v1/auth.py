"""
Authentication Endpoints
Login and user management
"""
from datetime import datetime, timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt

from app.api.deps import get_db, get_current_user, require_admin
from app.config import get_settings
from app.schemas.user import UserLogin, UserCreate, UserResponse, Token
from app.crud import user as user_crud
from app.utils.security import create_access_token

router = APIRouter()
settings = get_settings()


@router.post("/login", response_model=Token)
async def login(
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
    
    # Create access token
    expires_minutes = settings.JWT_EXPIRE_MINUTES
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=expires_minutes)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": expires_minutes * 60  # convert to seconds
    }


@router.post("/login/json", response_model=Token)
async def login_json(
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
    
    # Create access token
    expires_minutes = settings.JWT_EXPIRE_MINUTES
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=expires_minutes)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": expires_minutes * 60  # convert to seconds
    }


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
            "full_name": current_user.full_name,
            "is_admin": current_user.is_admin
        }
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Refresh access token
    Requires a valid (non-expired) token to issue a new one
    """
    # Create new access token
    expires_minutes = settings.JWT_EXPIRE_MINUTES
    access_token = create_access_token(
        data={"sub": str(current_user.id)},
        expires_delta=timedelta(minutes=expires_minutes)
    )
    
    # Update last login
    user_crud.update_last_login(db, current_user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": expires_minutes * 60  # convert to seconds
    }
