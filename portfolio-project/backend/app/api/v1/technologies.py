"""
Technologies API endpoints
"""
from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, require_admin
from app.models.user import User
from app.schemas.technology import TechnologyCreate, TechnologyUpdate, TechnologyResponse
from app.crud import technology as technology_crud

router = APIRouter()


@router.get("/", response_model=List[TechnologyResponse])
def get_technologies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category: str | None = None,
    db: Session = Depends(get_db)
):
    """
    Get all technologies (public)
    """
    return technology_crud.get_technologies(db, skip=skip, limit=limit, category=category)


@router.get("/{technology_id}", response_model=TechnologyResponse)
def get_technology(
    technology_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Get single technology by ID (public)
    """
    technology = technology_crud.get_technology_by_id(db, technology_id)
    if not technology:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technology not found"
        )
    return technology


@router.post("/", response_model=TechnologyResponse, status_code=status.HTTP_201_CREATED)
def create_technology(
    technology: TechnologyCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Create new technology (admin only)
    """
    try:
        return technology_crud.create_technology(db, technology)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{technology_id}", response_model=TechnologyResponse)
def update_technology(
    technology_id: uuid.UUID,
    technology: TechnologyUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Update technology (admin only)
    """
    try:
        updated = technology_crud.update_technology(db, technology_id, technology)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technology not found"
        )
    return updated


@router.delete("/{technology_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_technology(
    technology_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Delete technology (admin only)
    """
    success = technology_crud.delete_technology(db, technology_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technology not found"
        )
    return None
