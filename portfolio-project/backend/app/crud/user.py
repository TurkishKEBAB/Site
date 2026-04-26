"""
User CRUD Operations
Authentication and user management
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.config import settings
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import get_password_hash, verify_password
from sqlalchemy import or_
from sqlalchemy.orm import Session


def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email_or_username(db: Session, identifier: str) -> Optional[User]:
    """Get user by email or username"""
    return (
        db.query(User)
        .filter(or_(User.email == identifier, User.username == identifier))
        .first()
    )


def create_user(db: Session, user: UserCreate) -> User:
    """
    Create a new user

    Args:
        db: Database session
        user: User creation schema

    Returns:
        Created user
    """
    hashed_password = get_password_hash(user.password)

    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        is_active=True,
        is_admin=user.email.lower() in set(settings.admin_email_list),
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _as_aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def is_user_locked(user: User) -> bool:
    """Return true when the user's login lockout is still active."""
    if not user.locked_until:
        return False
    return _as_aware_utc(user.locked_until) > _utc_now()


def record_failed_login(db: Session, user: User) -> User:
    """Increment failed login count and lock the user when threshold is reached."""
    user.failed_login_count = (user.failed_login_count or 0) + 1
    if user.failed_login_count >= settings.LOGIN_MAX_FAILED_ATTEMPTS:
        user.locked_until = _utc_now() + timedelta(
            minutes=settings.LOGIN_LOCKOUT_MINUTES,
        )
    db.commit()
    db.refresh(user)
    return user


def reset_login_failures(db: Session, user: User) -> User:
    """Clear failed login state after a successful authentication."""
    user.failed_login_count = 0
    user.locked_until = None
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate user with email and password

    Args:
        db: Database session
        email: User email
        password: Plain text password

    Returns:
        User if authentication successful, None otherwise
    """
    user = get_user_by_email(db, email)

    if not user:
        return None
    if is_user_locked(user):
        return None

    if not verify_password(password, user.password_hash):
        record_failed_login(db, user)
        return None

    if not user.is_active:
        return None

    reset_login_failures(db, user)
    return user


def update_last_login(db: Session, user_id: uuid.UUID) -> User:
    """
    Update user's last login timestamp

    Args:
        db: Database session
        user_id: User ID

    Returns:
        Updated user
    """
    user = get_user_by_id(db, user_id)
    if user:
        user.last_login = datetime.now(timezone.utc)
        user.failed_login_count = 0
        user.locked_until = None
        db.commit()
        db.refresh(user)

    return user
