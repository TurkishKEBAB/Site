"""
Admin Schemas
"""
from pydantic import BaseModel


class AdminStatsResponse(BaseModel):
    """Dashboard statistics for the admin panel."""

    projects: int = 0
    skills: int = 0
    experiences: int = 0
    messages: int = 0
    unread_messages: int = 0

    class Config:
        from_attributes = True
