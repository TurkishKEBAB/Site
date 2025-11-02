"""
Experience Schemas
Education, work, volunteer activities with translations
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
import uuid


class ExperienceTranslationBase(BaseModel):
    """Base experience translation schema"""
    language: str = Field(..., min_length=2, max_length=5, pattern="^(tr|en|de|fr)$")
    title: str = Field(..., min_length=1, max_length=255)
    organization: str = Field(..., min_length=1, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None


class ExperienceTranslationCreate(ExperienceTranslationBase):
    """Experience translation creation schema"""
    pass


class ExperienceTranslation(ExperienceTranslationBase):
    """Experience translation response schema"""
    id: uuid.UUID
    experience_id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class ExperienceBase(BaseModel):
    """Base experience schema"""
    title: str = Field(..., min_length=1, max_length=255)
    organization: str = Field(..., min_length=1, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    experience_type: str = Field(..., pattern="^(education|work|volunteer|activity)$")
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None
    display_order: int = 0


class ExperienceCreate(ExperienceBase):
    """Experience creation schema"""
    translations: Optional[List[ExperienceTranslationCreate]] = None


class ExperienceUpdate(BaseModel):
    """Experience update schema (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    organization: Optional[str] = Field(None, min_length=1, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    experience_type: Optional[str] = Field(None, pattern="^(education|work|volunteer|activity)$")
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    description: Optional[str] = None
    display_order: Optional[int] = None


class Experience(ExperienceBase):
    """Experience response schema"""
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    translations: List[ExperienceTranslation] = []
    
    class Config:
        from_attributes = True


# Alias for backward compatibility
ExperienceResponse = Experience


class ExperienceList(BaseModel):
    """Experiences list with pagination"""
    experiences: List[Experience]
    total: int
    skip: int
    limit: int


# Alias for backward compatibility
ExperienceListResponse = ExperienceList
