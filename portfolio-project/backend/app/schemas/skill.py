"""
Skill Schemas
Skills with domain (capability group) + ring (tech-radar) and translations
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime
import uuid

SkillDomain = Literal["backend", "cloud", "product", "testing", "research"]
SkillRing = Literal["adopt", "trial", "assess", "hold"]


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
    
    model_config = ConfigDict(from_attributes=True)


class SkillBase(BaseModel):
    """Base skill schema"""
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=50)
    domain: SkillDomain = Field("backend", description="CapabilityMatrix group")
    ring: SkillRing = Field("assess", description="TechRadar ring")
    icon: Optional[str] = Field(None, max_length=500)
    display_order: int = 0


class SkillCreate(SkillBase):
    """Skill creation schema"""
    translations: Optional[List[SkillTranslationCreate]] = None


class SkillUpdate(BaseModel):
    """Skill update schema (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    domain: Optional[SkillDomain] = None
    ring: Optional[SkillRing] = None
    icon: Optional[str] = Field(None, max_length=500)
    display_order: Optional[int] = None
    translations: Optional[List[SkillTranslationCreate]] = None


class Skill(SkillBase):
    """Skill response schema"""
    id: uuid.UUID
    created_at: datetime
    translations: List[SkillTranslation] = []
    
    model_config = ConfigDict(from_attributes=True)


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
