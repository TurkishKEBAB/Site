"""
Contact Message Schemas
Contact form submissions
"""
from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class ContactMessageBase(BaseModel):
    """Base contact message schema"""

    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    subject: str = Field(..., min_length=1, max_length=500)
    message: str = Field(..., min_length=10, max_length=5000)


class ContactMessageCreate(ContactMessageBase):
    """Contact message creation schema"""
    captcha_token: Optional[str] = Field(default=None, max_length=4096)


class ContactMessage(ContactMessageBase):
    """Contact message response schema (admin only)"""

    id: uuid.UUID
    is_read: bool = False
    is_replied: bool = False
    ip_address: Optional[str] = None
    user_agent: Optional[str] = Field(None, max_length=512)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContactMessageResponse(BaseModel):
    """Public response after submitting contact form"""

    success: bool
    message: str
    message_id: uuid.UUID


class ContactMessageUpdate(BaseModel):
    """Update contact message status (admin only)"""

    is_read: Optional[bool] = None
    is_replied: Optional[bool] = None


class ContactMessageListResponse(BaseModel):
    """Paginated list response for admin panel"""

    messages: list[ContactMessage]
    total: int
    skip: int
    limit: int
    unread_count: int
