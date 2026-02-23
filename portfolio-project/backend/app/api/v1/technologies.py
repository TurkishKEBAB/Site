"""
Technologies API endpoints
"""
from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, require_admin
from app.models.user import User
from app.models.technology import Technology
from app.schemas.technology import TechnologyCreate, TechnologyUpdate, TechnologyResponse

router = APIRouter()


@router.get("/", response_model=List[TechnologyResponse])
def get_technologies(
    skip: int = 0,
    limit: int = 100,
    category: str | None = None,
    db: Session = Depends(get_db)
):
    """
    Get all technologies (public)
    """
    query = db.query(Technology)
    
    if category:
        query = query.filter(Technology.category == category)
    
    technologies = query.order_by(Technology.name).offset(skip).limit(limit).all()
    return technologies


@router.get("/{technology_id}", response_model=TechnologyResponse)
def get_technology(
    technology_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Get single technology by ID (public)
    """
    technology = db.query(Technology).filter(Technology.id == technology_id).first()
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
    # Check if technology with same name or slug exists
    existing = db.query(Technology).filter(
        (Technology.name == technology.name) | (Technology.slug == technology.slug)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Technology with this name or slug already exists"
        )
    
    db_technology = Technology(**technology.model_dump())
    db.add(db_technology)
    db.commit()
    db.refresh(db_technology)
    return db_technology


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
    db_technology = db.query(Technology).filter(Technology.id == technology_id).first()
    if not db_technology:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technology not found"
        )
    
    # Check for duplicates if name/slug changed
    if technology.name or technology.slug:
        existing = db.query(Technology).filter(
            Technology.id != technology_id,
            (Technology.name == (technology.name or db_technology.name)) |
            (Technology.slug == (technology.slug or db_technology.slug))
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Technology with this name or slug already exists"
            )
    
    # Update fields
    update_data = technology.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_technology, field, value)
    
    db.commit()
    db.refresh(db_technology)
    return db_technology


@router.delete("/{technology_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_technology(
    technology_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Delete technology (admin only)
    """
    db_technology = db.query(Technology).filter(Technology.id == technology_id).first()
    if not db_technology:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technology not found"
        )
    
    db.delete(db_technology)
    db.commit()
    return None
