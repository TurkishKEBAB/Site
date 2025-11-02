"""
Site Configuration, Translations, and Analytics Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid


class SiteConfigBase(BaseModel):
    """Base site configuration schema"""
    key: str = Field(..., min_length=1, max_length=100)
    value: str
    description: Optional[str] = None


class SiteConfigCreate(SiteConfigBase):
    """Site configuration creation schema"""
    pass


class SiteConfig(SiteConfigBase):
    """Site configuration response schema"""
    id: uuid.UUID
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SiteConfigResponse(BaseModel):
    """Public site configuration response"""
    config: Dict[str, str]


class TranslationBase(BaseModel):
    """Base translation schema"""
    language: str = Field(..., min_length=2, max_length=5, pattern="^(tr|en|de|fr)$")
    translation_key: str = Field(..., min_length=1, max_length=255)
    value: str


class TranslationCreate(TranslationBase):
    """Translation creation schema"""
    pass


class Translation(TranslationBase):
    """Translation response schema"""
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TranslationResponse(BaseModel):
    """Translations grouped by language"""
    language: str
    translations: Dict[str, str]


class PageViewCreate(BaseModel):
    """Page view creation schema (for analytics)"""
    page_path: str = Field(..., max_length=500)
    referrer: Optional[str] = Field(None, max_length=500)


class PageView(PageViewCreate):
    """Page view response schema"""
    id: uuid.UUID
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    viewed_at: datetime
    
    class Config:
        from_attributes = True


class AnalyticsSummary(BaseModel):
    """Analytics summary response"""
    total_views: int
    popular_pages: list
    recent_views: int  # Last 24 hours
