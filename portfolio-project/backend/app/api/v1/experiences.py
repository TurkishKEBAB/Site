"""
Experience Endpoints
CRUD operations for work experiences, education, and volunteering
"""
from collections import defaultdict
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import uuid

from app.api.deps import get_db, require_admin
from app.schemas.experience import (
    ExperienceCreate,
    ExperienceUpdate,
    ExperienceResponse,
    ExperienceListResponse
)
from app.crud import experience as experience_crud

router = APIRouter()


@router.get("/", response_model=ExperienceListResponse)
def get_experiences(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    experience_type: str = Query(None),
    language: str = Query("en", pattern="^(tr|en)$"),
    db: Session = Depends(get_db)
):
    """
    Get list of experiences with optional type filtering
    """
    # Get total count
    total = experience_crud.get_experiences_count(db, experience_type=experience_type)

    experiences = experience_crud.get_experiences(
        db,
        skip=skip,
        limit=limit,
        experience_type=experience_type,
        language=language,
    )
    
    return {
        "experiences": experiences,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/by-type", response_model=Dict[str, List[ExperienceResponse]])
def get_experiences_grouped_by_type(
    language: str = Query("en", pattern="^(tr|en)$"),
    db: Session = Depends(get_db)
):
    """
    Get experiences grouped by type (work, education, volunteer)
    Returns a dictionary with types as keys
    """
    all_experiences = experience_crud.get_experiences(db, limit=1000, language=language)
    grouped: Dict[str, List] = defaultdict(list)
    for exp in all_experiences:
        grouped[exp.experience_type].append(exp)
    return {
        "work": grouped.get("work", []),
        "education": grouped.get("education", []),
        "volunteer": grouped.get("volunteer", []),
        "activity": grouped.get("activity", []),
    }


@router.get("/{experience_id}", response_model=ExperienceResponse)
def get_experience(
    experience_id: uuid.UUID,
    language: str = Query("en", pattern="^(tr|en)$"),
    db: Session = Depends(get_db)
):
    """
    Get a specific experience by ID
    """
    experience = experience_crud.get_experience_by_id(db, experience_id=experience_id, language=language)
    
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found"
        )
    
    return experience


@router.post("/", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def create_experience(
    experience_data: ExperienceCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Create a new experience entry (admin only)
    """
    return experience_crud.create_experience(db, experience_data)


@router.put("/{experience_id}", response_model=ExperienceResponse)
def update_experience(
    experience_id: uuid.UUID,
    experience_data: ExperienceUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Update an experience entry (admin only)
    """
    updated_experience = experience_crud.update_experience(
        db,
        experience_id=experience_id,
        experience_update=experience_data
    )
    
    if not updated_experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found"
        )
    
    return updated_experience


@router.delete("/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience(
    experience_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Delete an experience entry (admin only)
    """
    success = experience_crud.delete_experience(db, experience_id=experience_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found"
        )
    
    return None
