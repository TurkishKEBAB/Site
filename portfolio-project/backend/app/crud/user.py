"""
User CRUD Operations
Authentication and user management
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
import uuid

from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import get_password_hash, verify_password


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
    return db.query(User).filter(
        or_(User.email == identifier, User.username == identifier)
    ).first()


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
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


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
    
    if not verify_password(password, user.password_hash):
        return None
    
    if not user.is_active:
        return None
    
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
    from datetime import datetime
    
    user = get_user_by_id(db, user_id)
    if user:
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
    
    return user
