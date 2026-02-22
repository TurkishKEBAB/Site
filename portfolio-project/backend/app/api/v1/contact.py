"""
Contact Form Endpoints
Submit and manage contact messages
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from loguru import logger
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.crud import contact as contact_crud
from app.schemas.contact import (
    ContactMessage,
    ContactMessageCreate,
    ContactMessageListResponse,
    ContactMessageResponse,
)
from app.services.email_service import EmailService

router = APIRouter()


@router.post('/', response_model=ContactMessageResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_message(
    message_data: ContactMessageCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Submit a contact form message (public endpoint)
    Sends confirmation email to sender and notification to admin.
    """
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get('user-agent')

    message = contact_crud.create_contact_message(
        db,
        message=message_data,
        ip_address=ip_address,
        user_agent=user_agent,
    )

    try:
        email_service = EmailService()
        message_preview = message.message[:100]

        await email_service.send_contact_form_confirmation(
            user_email=message.email,
            user_name=message.name,
            message_content=message_preview,
        )

        await email_service.send_admin_notification(
            user_name=message.name,
            user_email=message.email,
            subject=message.subject,
            message_content=message.message,
        )
    except Exception:
        logger.exception('Email sending failed while processing contact message')

    return {
        'success': True,
        'message': 'Your message has been sent successfully.',
        'message_id': message.id,
    }


@router.get('/', response_model=ContactMessageListResponse)
async def get_contact_messages(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = False,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Get list of contact messages (admin only)."""
    messages = contact_crud.get_contact_messages(
        db,
        skip=skip,
        limit=limit,
        unread_only=unread_only,
    )

    total = len(contact_crud.get_contact_messages(db, unread_only=unread_only))

    return {
        'messages': messages,
        'total': total,
        'skip': skip,
        'limit': limit,
        'unread_count': contact_crud.get_unread_count(db),
    }


@router.get('/unread-count')
async def get_unread_count(
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Get count of unread messages (admin only)."""
    return {'unread_count': contact_crud.get_unread_count(db)}


@router.get('/{message_id}', response_model=ContactMessage)
async def get_contact_message(
    message_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Get a specific contact message (admin only)."""
    message = contact_crud.get_contact_message_by_id(db, message_id=message_id)

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Message not found',
        )

    return message


@router.patch('/{message_id}/read', response_model=ContactMessage)
async def mark_message_as_read(
    message_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Mark a message as read (admin only)."""
    message = contact_crud.mark_message_as_read(db, message_id=message_id)

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Message not found',
        )

    return message


@router.patch('/{message_id}/replied', response_model=ContactMessage)
async def mark_message_as_replied(
    message_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Mark a message as replied (admin only)."""
    message = contact_crud.mark_message_as_replied(db, message_id=message_id)

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Message not found',
        )

    return message


@router.delete('/{message_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact_message(
    message_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Delete a contact message (admin only)."""
    success = contact_crud.delete_contact_message(db, message_id=message_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Message not found',
        )

    return None
