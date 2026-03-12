"""
Token session and blacklist CRUD helpers.
"""
from datetime import datetime, timezone
from typing import Optional
import uuid

from sqlalchemy.orm import Session

from app.models.auth import RefreshTokenSession, TokenBlacklist


def create_refresh_token_session(
    db: Session,
    *,
    user_id: uuid.UUID,
    token_jti: str,
    expires_at: datetime,
    created_from_ip: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> RefreshTokenSession:
    session = RefreshTokenSession(
        user_id=user_id,
        token_jti=token_jti,
        expires_at=expires_at,
        created_from_ip=created_from_ip,
        user_agent=user_agent,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_refresh_token_session(db: Session, token_jti: str) -> Optional[RefreshTokenSession]:
    return (
        db.query(RefreshTokenSession)
        .filter(RefreshTokenSession.token_jti == token_jti)
        .first()
    )


def revoke_refresh_token_session(
    db: Session,
    *,
    token_jti: str,
    replaced_by_jti: Optional[str] = None,
) -> Optional[RefreshTokenSession]:
    session = get_refresh_token_session(db, token_jti)
    if not session:
        return None

    if session.revoked_at is None:
        session.revoked_at = datetime.now(timezone.utc)
    if replaced_by_jti:
        session.replaced_by_jti = replaced_by_jti
    db.commit()
    db.refresh(session)
    return session


def is_refresh_token_session_active(
    db: Session,
    *,
    token_jti: str,
    user_id: uuid.UUID,
) -> bool:
    session = get_refresh_token_session(db, token_jti)
    if not session:
        return False
    if session.user_id != user_id:
        return False
    if session.revoked_at is not None:
        return False
    expires_at = session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at > datetime.now(timezone.utc)


def blacklist_token(
    db: Session,
    *,
    token_jti: str,
    token_type: str,
    expires_at: Optional[datetime] = None,
    reason: Optional[str] = None,
) -> TokenBlacklist:
    existing = get_blacklisted_token(db, token_jti)
    if existing:
        return existing

    blacklisted = TokenBlacklist(
        token_jti=token_jti,
        token_type=token_type,
        expires_at=expires_at,
        reason=reason,
    )
    db.add(blacklisted)
    db.commit()
    db.refresh(blacklisted)
    return blacklisted


def get_blacklisted_token(db: Session, token_jti: str) -> Optional[TokenBlacklist]:
    return db.query(TokenBlacklist).filter(TokenBlacklist.token_jti == token_jti).first()


def is_token_blacklisted(db: Session, token_jti: Optional[str]) -> bool:
    if not token_jti:
        return False
    return get_blacklisted_token(db, token_jti) is not None


def cleanup_expired_tokens(db: Session) -> int:
    """Delete expired entries from TokenBlacklist and RefreshTokenSession tables.

    Returns the number of blacklist rows deleted.
    """
    cutoff = datetime.now(timezone.utc)
    deleted = (
        db.query(TokenBlacklist)
        .filter(TokenBlacklist.expires_at < cutoff)
        .delete(synchronize_session=False)
    )
    db.query(RefreshTokenSession).filter(
        RefreshTokenSession.expires_at < cutoff
    ).delete(synchronize_session=False)
    db.commit()
    return deleted
