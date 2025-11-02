"""
Skill CRUD Operations
Skills and translations management
"""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional, Dict
import uuid

from app.models.skill import Skill, SkillTranslation
from app.schemas.skill import SkillCreate, SkillUpdate


def get_skills(
    db: Session, 
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None
) -> List[Skill]:
    """
    Get list of skills
    
    Args:
        db: Database session
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        category: Filter by category
        
    Returns:
        List of skills
    """
    query = db.query(Skill).options(joinedload(Skill.translations))
    
    if category:
        query = query.filter(Skill.category == category)
    
    query = query.order_by(Skill.category, Skill.display_order, Skill.proficiency.desc())
    
    return query.offset(skip).limit(limit).all()


def get_skills_by_category(db: Session, language: Optional[str] = None) -> Dict[str, List[Skill]]:
    """
    Get skills grouped by category
    
    Returns:
        Dictionary with categories as keys and skill lists as values
    """
    skills = get_skills(db)
    
    grouped = {}
    for skill in skills:
        if skill.category not in grouped:
            grouped[skill.category] = []
        grouped[skill.category].append(skill)
    
    return grouped


def get_skill_by_id(db: Session, skill_id: uuid.UUID) -> Optional[Skill]:
    """Get skill by ID with translations"""
    return db.query(Skill).options(
        joinedload(Skill.translations)
    ).filter(Skill.id == skill_id).first()


def create_skill(db: Session, skill: SkillCreate) -> Skill:
    """
    Create a new skill
    
    Args:
        db: Database session
        skill: Skill creation schema
        
    Returns:
        Created skill
    """
    db_skill = Skill(
        name=skill.name,
        category=skill.category,
        proficiency=skill.proficiency,
        icon=skill.icon,
        display_order=skill.display_order
    )
    
    db.add(db_skill)
    db.flush()
    
    # Add translations if provided
    if skill.translations:
        for translation in skill.translations:
            db_translation = SkillTranslation(
                skill_id=db_skill.id,
                language=translation.language,
                name=translation.name,
                category=translation.category
            )
            db.add(db_translation)
    
    db.commit()
    db.refresh(db_skill)
    
    return db_skill


def update_skill(db: Session, skill_id: uuid.UUID, skill_update: SkillUpdate) -> Optional[Skill]:
    """Update a skill"""
    db_skill = get_skill_by_id(db, skill_id)
    
    if not db_skill:
        return None
    
    update_data = skill_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_skill, field, value)
    
    db.commit()
    db.refresh(db_skill)
    
    return db_skill


def delete_skill(db: Session, skill_id: uuid.UUID) -> bool:
    """Delete a skill"""
    db_skill = get_skill_by_id(db, skill_id)
    
    if not db_skill:
        return False
    
    db.delete(db_skill)
    db.commit()
    
    return True


def get_skill_categories(db: Session) -> List[str]:
    """Get list of unique skill categories"""
    return [cat[0] for cat in db.query(Skill.category).distinct().all()]
