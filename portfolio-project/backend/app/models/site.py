"""
Site Models
Configuration, translations, and analytics
"""
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database import Base


class SiteConfig(Base):
    """
    Site configuration key-value store
    """
    __tablename__ = "site_config"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<SiteConfig {self.key}>"
    
    class Config:
        from_attributes = True


class Translation(Base):
    """
    UI element translations
    Supports: TR, EN, DE, FR
    """
    __tablename__ = "translations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    language = Column(String(5), nullable=False, index=True)
    translation_key = Column(String(255), nullable=False, index=True)
    value = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Translation {self.language}.{self.translation_key}>"
    
    class Config:
        from_attributes = True


class PageView(Base):
    """
    Simple analytics - page view tracking
    """
    __tablename__ = "page_views"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    page_path = Column(String(500), nullable=False, index=True)
    referrer = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<PageView {self.page_path}>"
    
    class Config:
        from_attributes = True
