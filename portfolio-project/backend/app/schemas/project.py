"""
Project Schemas
Portfolio projects with translations and technologies
"""
from pydantic import BaseModel, Field, HttpUrl, model_validator
from typing import Optional, List, Any
from datetime import datetime
import uuid


class ProjectTranslationBase(BaseModel):
    """Base project translation schema"""
    language: str = Field(..., min_length=2, max_length=5, pattern="^(tr|en|de|fr)$")
    title: str = Field(..., min_length=1, max_length=255)
    short_description: Optional[str] = None
    description: str = Field(..., min_length=1)


class ProjectTranslationCreate(ProjectTranslationBase):
    """Project translation creation schema"""
    pass


class ProjectTranslation(ProjectTranslationBase):
    """Project translation response schema"""
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProjectImageBase(BaseModel):
    """Base project image schema"""
    image_url: HttpUrl
    caption: Optional[str] = None
    display_order: int = 0


class ProjectImageCreate(ProjectImageBase):
    """Project image creation schema"""
    pass


class ProjectImage(ProjectImageBase):
    """Project image response schema"""
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class TechnologyRef(BaseModel):
    """Technology reference (for project technologies)"""
    id: uuid.UUID
    name: str
    slug: str
    icon: Optional[str] = None
    color: Optional[str] = None
    category: Optional[str] = None
    
    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    """Base project schema"""
    title: str = Field(..., min_length=1, max_length=255)
    short_description: Optional[str] = None
    description: str = Field(..., min_length=1)
    cover_image: Optional[HttpUrl] = None
    github_url: Optional[HttpUrl] = None
    demo_url: Optional[HttpUrl] = None
    featured: bool = False
    display_order: int = 0


class ProjectCreate(ProjectBase):
    """Project creation schema"""
    slug: Optional[str] = Field(None, max_length=255)
    technology_ids: Optional[List[uuid.UUID]] = None
    translations: Optional[List[ProjectTranslationCreate]] = None
    images: Optional[List[ProjectImageCreate]] = None


class ProjectUpdate(BaseModel):
    """Project update schema (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    short_description: Optional[str] = None
    description: Optional[str] = Field(None, min_length=1)
    cover_image: Optional[HttpUrl] = None
    github_url: Optional[HttpUrl] = None
    demo_url: Optional[HttpUrl] = None
    featured: Optional[bool] = None
    display_order: Optional[int] = None
    technology_ids: Optional[List[uuid.UUID]] = None


class Project(ProjectBase):
    """Project response schema"""
    id: uuid.UUID
    slug: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProjectDetail(Project):
    """Project detail with translations, technologies, and images"""
    translations: List[ProjectTranslation] = []
    technologies: List[TechnologyRef] = []
    images: List[ProjectImage] = []
    
    class Config:
        from_attributes = True


# Aliases for backward compatibility
ProjectResponse = ProjectDetail  # Changed from Project to ProjectDetail
ProjectDetailResponse = ProjectDetail


class ProjectList(BaseModel):
    """Paginated project list response"""
    items: List[ProjectDetail]  # Changed from Project to ProjectDetail
    total: int
    page: int
    size: int
    pages: int


# Alias for backward compatibility
ProjectListResponse = ProjectList
