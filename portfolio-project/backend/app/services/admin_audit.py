"""Helpers for writing admin action audit records."""

import uuid
from typing import Any

from app.models.admin import AdminActionLog
from app.models.user import User
from sqlalchemy.orm import Session


def record_admin_action(
    db: Session,
    *,
    actor: User,
    action: str,
    target_type: str,
    target_id: uuid.UUID | str | None = None,
    details: dict[str, Any] | None = None,
) -> AdminActionLog:
    """Persist a compact audit record for a critical admin action."""
    log = AdminActionLog(
        actor_id=actor.id,
        action=action,
        target_type=target_type,
        target_id=str(target_id) if target_id is not None else None,
        details=details,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
