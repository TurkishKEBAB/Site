"""
Blog Schemas
Blog posts and translations
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
import uuid


class BlogTranslationBase(BaseModel):
    """Base blog translation schema"""
    language: str = Field(..., min_length=2, max_length=5, pattern="^(tr|en|de|fr)$")
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    excerpt: Optional[str] = None


class BlogTranslationCreate(BlogTranslationBase):
    """Blog translation creation schema"""
    pass


class BlogTranslation(BlogTranslationBase):
    """Blog translation response schema"""
    id: uuid.UUID
    blog_post_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BlogPostBase(BaseModel):
    """Base blog post schema"""
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    excerpt: Optional[str] = Field(None, max_length=500)
    cover_image: Optional[HttpUrl] = None
    published: bool = False


class BlogPostCreate(BlogPostBase):
    """Blog post creation schema"""
    slug: Optional[str] = Field(None, max_length=255)
    reading_time: Optional[int] = Field(None, ge=0)  # Auto-calculated if not provided
    translations: Optional[List[BlogTranslationCreate]] = None


class BlogPostUpdate(BaseModel):
    """Blog post update schema (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    excerpt: Optional[str] = Field(None, max_length=500)
    cover_image: Optional[HttpUrl] = None
    published: Optional[bool] = None
    reading_time: Optional[int] = Field(None, ge=0)


class BlogPost(BlogPostBase):
    """Blog post response schema"""
    id: uuid.UUID
    slug: str
    author_id: uuid.UUID
    views: int = 0
    reading_time: Optional[int] = None
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BlogPostDetail(BlogPost):
    """Blog post detail with translations"""
    translations: List[BlogTranslation] = []
    author_username: Optional[str] = None
    
    class Config:
        from_attributes = True


# Aliases for backward compatibility
BlogPostResponse = BlogPost


class BlogPostList(BaseModel):
    """Paginated blog post list response"""
    items: List[BlogPost]
    total: int
    page: int
    size: int
    pages: int


# Alias for backward compatibility
BlogPostListResponse = BlogPostList
