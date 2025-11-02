"""
Contact Message Schemas
Contact form submissions
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid


class ContactMessageBase(BaseModel):
    """Base contact message schema"""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    subject: str = Field(..., min_length=1, max_length=500)
    message: str = Field(..., min_length=10)


class ContactMessageCreate(ContactMessageBase):
    """Contact message creation schema"""
    pass


class ContactMessage(ContactMessageBase):
    """Contact message response schema (admin only)"""
    id: uuid.UUID
    is_read: bool = False
    is_replied: bool = False
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ContactMessageResponse(BaseModel):
    """Public response after submitting contact form"""
    success: bool
    message: str
    message_id: uuid.UUID


class ContactMessageUpdate(BaseModel):
    """Update contact message status (admin only)"""
    is_read: Optional[bool] = None
    is_replied: Optional[bool] = None


class ContactMessageList(BaseModel):
    """List of contact messages"""
    messages: List[ContactMessage]
    total: int


# Alias for backward compatibility
ContactMessageListResponse = ContactMessageList
