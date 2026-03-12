"""
Technology CRUD Operations
Technologies (languages, frameworks, tools) management
"""
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.models.technology import Technology
from app.schemas.technology import TechnologyCreate, TechnologyUpdate


def get_technologies(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
) -> List[Technology]:
    """Get list of technologies with optional category filter."""
    query = db.query(Technology)

    if category:
        query = query.filter(Technology.category == category)

    return query.order_by(Technology.name).offset(skip).limit(limit).all()


def get_technology_by_id(
    db: Session,
    technology_id: uuid.UUID,
) -> Optional[Technology]:
    """Get a single technology by ID."""
    return db.query(Technology).filter(Technology.id == technology_id).first()


def create_technology(
    db: Session,
    technology: TechnologyCreate,
) -> Technology:
    """Create a new technology. Raises ValueError if name/slug already exists."""
    existing = db.query(Technology).filter(
        (Technology.name == technology.name) | (Technology.slug == technology.slug)
    ).first()

    if existing:
        raise ValueError("Technology with this name or slug already exists")

    db_technology = Technology(**technology.model_dump())
    db.add(db_technology)
    db.commit()
    db.refresh(db_technology)
    return db_technology


def update_technology(
    db: Session,
    technology_id: uuid.UUID,
    technology_update: TechnologyUpdate,
) -> Optional[Technology]:
    """Update a technology. Returns None if not found, raises ValueError on duplicate."""
    db_technology = get_technology_by_id(db, technology_id)
    if not db_technology:
        return None

    # Check for duplicates if name/slug changed
    if technology_update.name or technology_update.slug:
        existing = db.query(Technology).filter(
            Technology.id != technology_id,
            (Technology.name == (technology_update.name or db_technology.name))
            | (Technology.slug == (technology_update.slug or db_technology.slug)),
        ).first()

        if existing:
            raise ValueError("Technology with this name or slug already exists")

    update_data = technology_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_technology, field, value)

    db.commit()
    db.refresh(db_technology)
    return db_technology


def delete_technology(db: Session, technology_id: uuid.UUID) -> bool:
    """Delete a technology. Returns True if deleted, False if not found."""
    db_technology = get_technology_by_id(db, technology_id)
    if not db_technology:
        return False

    db.delete(db_technology)
    db.commit()
    return True
