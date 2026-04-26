"""Helpers for writing admin action audit records."""

import logging
import uuid
from typing import Any

from app.models.admin import AdminActionLog
from app.models.user import User
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def record_admin_action(
    db: Session,
    *,
    actor: User,
    action: str,
    target_type: str,
    target_id: uuid.UUID | str | None = None,
    details: dict[str, Any] | None = None,
) -> AdminActionLog | None:
    """Persist a compact audit record for a critical admin action.

    Audit writes happen after the primary mutation has already been committed,
    so a failure here must not surface as a 500 to the client. We log the
    failure and roll back the audit-only state instead.
    """
    log = AdminActionLog(
        actor_id=actor.id,
        action=action,
        target_type=target_type,
        target_id=str(target_id) if target_id is not None else None,
        details=details,
    )
    try:
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
    except SQLAlchemyError:
        logger.exception(
            "Failed to record admin action %s on %s by actor %s",
            action,
            target_type,
            actor.id,
        )
        db.rollback()
        return None
