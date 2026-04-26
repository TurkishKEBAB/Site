"""Admin audit models."""

import uuid

import sqlalchemy as sa
from app.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class AdminActionLog(Base):
    """Audit log for critical admin actions."""

    __tablename__ = "admin_action_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    action = Column(String(100), nullable=False, index=True)
    target_type = Column(String(100), nullable=False, index=True)
    target_id = Column(String(128), nullable=True, index=True)
    details = Column(sa.JSON().with_variant(JSONB, "postgresql"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    actor = relationship("User", back_populates="admin_action_logs")

    def __repr__(self):
        return f"<AdminActionLog {self.action} {self.target_type}:{self.target_id}>"
