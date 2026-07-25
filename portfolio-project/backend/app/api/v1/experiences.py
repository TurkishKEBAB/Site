"""
Experience Endpoints
CRUD operations for work experiences, education, and volunteering
"""

import uuid
from typing import Dict, List

from app.api.deps import get_db, require_admin
from app.crud import experience as experience_crud
from app.models.experience import Experience
from app.models.user import User
from app.schemas.experience import (
    ExperienceCreate,
    ExperienceListResponse,
    ExperienceResponse,
    ExperienceUpdate,
)
from app.services.admin_audit import record_admin_action
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=ExperienceListResponse)
def get_experiences(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    experience_type: str = Query(None),
    language: str = Query("en", pattern="^(tr|en)$"),
    db: Session = Depends(get_db),
):
    """
    Get list of experiences with optional type filtering
    """
    # Get total count
    count_query = db.query(func.count(Experience.id))
    if experience_type:
        count_query = count_query.filter(Experience.experience_type == experience_type)
    total = count_query.scalar()

    experiences = experience_crud.get_experiences(
        db,
        skip=skip,
        limit=limit,
        experience_type=experience_type,
        language=language,
    )

    return {"experiences": experiences, "total": total, "skip": skip, "limit": limit}


@router.get("/by-type", response_model=Dict[str, List[ExperienceResponse]])
def get_experiences_grouped_by_type(
    language: str = Query("en", pattern="^(tr|en)$"), db: Session = Depends(get_db)
):
    """
    Get experiences grouped by type (work, education, volunteer)
    Returns a dictionary with types as keys
    """
    all_experiences = experience_crud.get_experiences(
        db, language=language, skip=0, limit=10000
    )
    grouped: dict = {}
    for exp in all_experiences:
        exp_type = getattr(exp, "experience_type", None)
        if exp_type not in grouped:
            grouped[exp_type] = []
        grouped[exp_type].append(exp)
    return grouped


@router.get("/{experience_id}", response_model=ExperienceResponse)
def get_experience(
    experience_id: uuid.UUID,
    language: str = Query("en", pattern="^(tr|en)$"),
    db: Session = Depends(get_db),
):
    """
    Get a specific experience by ID
    """
    experience = experience_crud.get_experience_by_id(
        db, experience_id=experience_id, language=language
    )

    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found"
        )

    return experience


@router.post(
    "/", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED
)
def create_experience(
    experience_data: ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Create a new experience entry (admin only)
    """
    experience = experience_crud.create_experience(db, experience_data)
    record_admin_action(
        db,
        actor=current_user,
        action="experience.create",
        target_type="experience",
        target_id=experience.id,
        details={"title": experience.title},
    )
    return experience


@router.put("/{experience_id}", response_model=ExperienceResponse)
def update_experience(
    experience_id: uuid.UUID,
    experience_data: ExperienceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Update an experience entry (admin only)
    """
    updated_experience = experience_crud.update_experience(
        db, experience_id=experience_id, experience_update=experience_data
    )

    if not updated_experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found"
        )

    record_admin_action(
        db,
        actor=current_user,
        action="experience.update",
        target_type="experience",
        target_id=experience_id,
        details={"title": updated_experience.title},
    )
    return updated_experience


@router.delete("/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience(
    experience_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Delete an experience entry (admin only)
    """
    success = experience_crud.delete_experience(db, experience_id=experience_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found"
        )

    record_admin_action(
        db,
        actor=current_user,
        action="experience.delete",
        target_type="experience",
        target_id=experience_id,
    )
    return None
