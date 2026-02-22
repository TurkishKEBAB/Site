"""
Experience CRUD Operations
Education, work, and volunteer activities management
"""
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import uuid

from app.models.experience import Experience, ExperienceTranslation
from app.schemas.experience import ExperienceCreate, ExperienceUpdate


def _apply_experience_translation(
    experience: Experience,
    language: Optional[str] = None,
) -> Experience:
    """Apply requested translation to an experience object with English fallback."""
    if not language or language == "en":
        return experience

    translations = experience.translations or []
    translated = next((item for item in translations if item.language == language), None)
    fallback = next((item for item in translations if item.language == "en"), None)
    source = translated or fallback

    if source:
        experience.title = source.title
        experience.organization = source.organization
        experience.location = source.location
        experience.description = source.description

    return experience


def get_experiences(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    experience_type: Optional[str] = None,
    current_only: bool = False,
    language: Optional[str] = None,
) -> List[Experience]:
    """
    Get list of experiences
    
    Args:
        db: Database session
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        experience_type: Filter by type (education, work, volunteer, activity)
        current_only: Only return current experiences
        
    Returns:
        List of experiences
    """
    query = db.query(Experience).options(joinedload(Experience.translations))
    
    if experience_type:
        query = query.filter(Experience.experience_type == experience_type)
    
    if current_only:
        query = query.filter(Experience.is_current == True)
    
    query = query.order_by(
        Experience.display_order,
        Experience.is_current.desc(),
        Experience.start_date.desc()
    )
    experiences = query.offset(skip).limit(limit).all()

    return [_apply_experience_translation(item, language) for item in experiences]


def get_experiences_by_type(
    db: Session,
    experience_type: str,
    language: Optional[str] = None
) -> List[Experience]:
    """Get experiences filtered by type"""
    return get_experiences(db, experience_type=experience_type, language=language)


def get_experience_by_id(
    db: Session,
    experience_id: uuid.UUID,
    language: Optional[str] = None
) -> Optional[Experience]:
    """Get experience by ID with translations"""
    experience = db.query(Experience).options(
        joinedload(Experience.translations)
    ).filter(Experience.id == experience_id).first()

    if not experience:
        return None

    return _apply_experience_translation(experience, language)


def create_experience(db: Session, experience: ExperienceCreate) -> Experience:
    """
    Create a new experience
    
    Args:
        db: Database session
        experience: Experience creation schema
        
    Returns:
        Created experience
    """
    db_experience = Experience(
        title=experience.title,
        organization=experience.organization,
        location=experience.location,
        experience_type=experience.experience_type,
        start_date=experience.start_date,
        end_date=experience.end_date,
        is_current=experience.is_current,
        description=experience.description,
        display_order=experience.display_order
    )
    
    db.add(db_experience)
    db.flush()
    
    # Add translations if provided
    if experience.translations:
        for translation in experience.translations:
            db_translation = ExperienceTranslation(
                experience_id=db_experience.id,
                language=translation.language,
                title=translation.title,
                organization=translation.organization,
                location=translation.location,
                description=translation.description
            )
            db.add(db_translation)
    
    db.commit()
    db.refresh(db_experience)
    
    return db_experience


def update_experience(
    db: Session,
    experience_id: uuid.UUID,
    experience_update: ExperienceUpdate
) -> Optional[Experience]:
    """Update an experience"""
    db_experience = get_experience_by_id(db, experience_id)
    
    if not db_experience:
        return None
    
    update_data = experience_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_experience, field, value)
    
    db.commit()
    db.refresh(db_experience)
    
    return db_experience


def delete_experience(db: Session, experience_id: uuid.UUID) -> bool:
    """Delete an experience"""
    db_experience = get_experience_by_id(db, experience_id)
    
    if not db_experience:
        return False
    
    db.delete(db_experience)
    db.commit()
    
    return True
