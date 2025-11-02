"""
Admin Endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.models.project import Project
from app.models.skill import Skill
from app.models.experience import Experience
from app.models.contact import ContactMessage
from app.schemas.admin import AdminStatsResponse

router = APIRouter()


@router.get("/stats", response_model=AdminStatsResponse, tags=["Admin"])
async def get_admin_stats(
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
) -> AdminStatsResponse:
    """Return aggregate counts for the admin dashboard."""

    total_messages = db.query(ContactMessage).count()
    unread_messages = (
        db.query(ContactMessage)
        .filter(ContactMessage.is_read.is_(False))
        .count()
    )

    return AdminStatsResponse(
        projects=db.query(Project).count(),
        skills=db.query(Skill).count(),
        experiences=db.query(Experience).count(),
        messages=total_messages,
        unread_messages=unread_messages,
    )
