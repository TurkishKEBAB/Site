"""
Contact Message CRUD Operations
Contact form submissions management
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import uuid

from app.models.contact import ContactMessage
from app.schemas.contact import ContactMessageCreate


def get_contact_messages(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    unread_only: bool = False
) -> List[ContactMessage]:
    """
    Get list of contact messages
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        unread_only: Only return unread messages
        
    Returns:
        List of contact messages
    """
    query = db.query(ContactMessage)
    
    if unread_only:
        query = query.filter(ContactMessage.is_read == False)
    
    query = query.order_by(ContactMessage.created_at.desc())
    
    return query.offset(skip).limit(limit).all()


def get_contact_message_by_id(db: Session, message_id: uuid.UUID) -> Optional[ContactMessage]:
    """Get contact message by ID"""
    return db.query(ContactMessage).filter(ContactMessage.id == message_id).first()


def create_contact_message(
    db: Session,
    message: ContactMessageCreate,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> ContactMessage:
    """
    Create a new contact message
    
    Args:
        db: Database session
        message: Contact message creation schema
        ip_address: Client IP address
        user_agent: Client user agent
        
    Returns:
        Created contact message
    """
    db_message = ContactMessage(
        name=message.name,
        email=message.email,
        subject=message.subject,
        message=message.message,
        ip_address=ip_address,
        user_agent=user_agent,
        is_read=False,
        is_replied=False
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message


def mark_message_as_read(db: Session, message_id: uuid.UUID) -> Optional[ContactMessage]:
    """Mark a contact message as read"""
    db_message = get_contact_message_by_id(db, message_id)
    
    if not db_message:
        return None
    
    db_message.is_read = True
    db.commit()
    db.refresh(db_message)
    
    return db_message


def mark_message_as_replied(db: Session, message_id: uuid.UUID) -> Optional[ContactMessage]:
    """Mark a contact message as replied"""
    db_message = get_contact_message_by_id(db, message_id)
    
    if not db_message:
        return None
    
    db_message.is_replied = True
    db.commit()
    db.refresh(db_message)
    
    return db_message


def delete_contact_message(db: Session, message_id: uuid.UUID) -> bool:
    """Delete a contact message"""
    db_message = get_contact_message_by_id(db, message_id)
    
    if not db_message:
        return False
    
    db.delete(db_message)
    db.commit()
    
    return True


def get_unread_count(db: Session) -> int:
    """Get count of unread messages"""
    return db.query(func.count(ContactMessage.id)).filter(
        ContactMessage.is_read == False
    ).scalar()
