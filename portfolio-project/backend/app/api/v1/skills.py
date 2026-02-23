"""
Skills Endpoints
CRUD operations for skills
"""
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import uuid

from app.api.deps import get_db, require_admin
from app.schemas.skill import (
    SkillCreate,
    SkillUpdate,
    SkillResponse,
    SkillListResponse
)
from app.crud import skill as skill_crud

router = APIRouter()


@router.get("/", response_model=SkillListResponse)
async def get_skills(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    language: str = Query("en", regex="^(tr|en)$"),
    db: Session = Depends(get_db)
):
    """
    Get list of all skills
    """
    # Get total count
    total_skills = skill_crud.get_skills(db, skip=0, limit=1000)
    total = len(total_skills)

    skills = skill_crud.get_skills(
        db,
        skip=skip,
        limit=limit,
        language=language,
    )
    
    return {
        "skills": skills,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/by-category", response_model=Dict[str, List[SkillResponse]])
async def get_skills_by_category(
    language: str = Query("en", regex="^(tr|en)$"),
    db: Session = Depends(get_db)
):
    """
    Get skills grouped by category
    Returns a dictionary with categories as keys
    """
    return skill_crud.get_skills_by_category(db, language=language)


@router.get("/{skill_id}", response_model=SkillResponse)
async def get_skill(
    skill_id: uuid.UUID,
    language: str = Query("en", regex="^(tr|en)$"),
    db: Session = Depends(get_db)
):
    """
    Get a specific skill by ID
    """
    skill = skill_crud.get_skill_by_id(db, skill_id=skill_id, language=language)
    
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    return skill


@router.post("/", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
async def create_skill(
    skill_data: SkillCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Create a new skill (admin only)
    """
    return skill_crud.create_skill(db, skill_data)


@router.put("/{skill_id}", response_model=SkillResponse)
async def update_skill(
    skill_id: uuid.UUID,
    skill_data: SkillUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Update a skill (admin only)
    """
    updated_skill = skill_crud.update_skill(db, skill_id=skill_id, skill_update=skill_data)
    
    if not updated_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    return updated_skill


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(
    skill_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Delete a skill (admin only)
    """
    success = skill_crud.delete_skill(db, skill_id=skill_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    return None
