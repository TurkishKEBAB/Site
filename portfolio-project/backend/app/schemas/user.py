"""
User Schemas
Authentication and user management
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema"""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    """User creation schema"""

    password: str = Field(..., min_length=8, max_length=100)


class UserLogin(BaseModel):
    """User login schema"""

    email: EmailStr
    password: str


class User(UserBase):
    """User response schema"""

    id: uuid.UUID
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True
    is_admin: bool = False

    model_config = ConfigDict(from_attributes=True)


# Alias for backward compatibility
UserResponse = User


class Token(BaseModel):
    """JWT token response"""

    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: Optional[int] = None  # seconds
    refresh_expires_in: Optional[int] = None  # seconds


class RefreshTokenRequest(BaseModel):
    """Refresh token request payload."""

    refresh_token: str


class TokenData(BaseModel):
    """Token payload data"""

    user_id: Optional[uuid.UUID] = None
    email: Optional[str] = None
