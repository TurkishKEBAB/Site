"""
Skill Schemas
Skills with proficiency levels and translations
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class SkillTranslationBase(BaseModel):
    """Base skill translation schema"""
    language: str = Field(..., min_length=2, max_length=5, pattern="^(tr|en|de|fr)$")
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=50)


class SkillTranslationCreate(SkillTranslationBase):
    """Skill translation creation schema"""
    pass


class SkillTranslation(SkillTranslationBase):
    """Skill translation response schema"""
    id: uuid.UUID
    skill_id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class SkillBase(BaseModel):
    """Base skill schema"""
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=50)
    proficiency: int = Field(..., ge=0, le=100, description="Proficiency level 0-100")
    icon: Optional[str] = Field(None, max_length=500)
    display_order: int = 0


class SkillCreate(SkillBase):
    """Skill creation schema"""
    translations: Optional[List[SkillTranslationCreate]] = None


class SkillUpdate(BaseModel):
    """Skill update schema (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    proficiency: Optional[int] = Field(None, ge=0, le=100)
    icon: Optional[str] = Field(None, max_length=500)
    display_order: Optional[int] = None


class Skill(SkillBase):
    """Skill response schema"""
    id: uuid.UUID
    created_at: datetime
    translations: List[SkillTranslation] = []
    
    class Config:
        from_attributes = True


# Alias for backward compatibility
SkillResponse = Skill


class SkillListByCategory(BaseModel):
    """Skills grouped by category"""
    category: str
    skills: List[Skill]


# Backward compatibility alias (some modules may still import SkillList)
SkillList = SkillListByCategory


class SkillListResponse(BaseModel):
    """Paginated list of skills"""
    skills: List[Skill]
    total: int
    skip: int
    limit: int
