"""
Blog Models
Blog posts and translations
"""
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class BlogPost(Base):
    """
    Blog post model with multi-language support
    """
    __tablename__ = "blog_posts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)
    cover_image = Column(String(500), nullable=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    published = Column(Boolean, default=False, index=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    views = Column(Integer, default=0, index=True)
    reading_time = Column(Integer, nullable=True)  # in minutes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    author = relationship("User", back_populates="blog_posts")
    translations = relationship("BlogTranslation", back_populates="blog_post", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<BlogPost {self.slug}>"
    
    class Config:
        from_attributes = True


class BlogTranslation(Base):
    """
    Blog post translations for multi-language support
    Supports: TR, EN, DE, FR
    """
    __tablename__ = "blog_translations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    blog_post_id = Column(UUID(as_uuid=True), ForeignKey("blog_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    language = Column(String(5), nullable=False, index=True)  # tr, en, de, fr
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    blog_post = relationship("BlogPost", back_populates="translations")
    
    def __repr__(self):
        return f"<BlogTranslation {self.blog_post_id} - {self.language}>"
    
    class Config:
        from_attributes = True
