"""
Technology Schema
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class TechnologyBase(BaseModel):
    """Base technology schema"""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    icon: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=50)  # language, framework, tool, cloud, database
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")  # Hex color


class TechnologyCreate(TechnologyBase):
    """Technology creation schema"""
    pass


class TechnologyUpdate(BaseModel):
    """Technology update schema - all fields optional"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)
    icon: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")


class Technology(TechnologyBase):
    """Technology database model schema"""
    id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class TechnologyResponse(Technology):
    """Technology response schema (alias for Technology)"""
    pass
