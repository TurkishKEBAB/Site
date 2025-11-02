"""
Experience Models
Education, work, volunteer activities with translations
"""
from sqlalchemy import Column, String, Text, Boolean, Date, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Experience(Base):
    """
    Experience model for education, work, volunteer activities
    Types: education, work, volunteer, activity
    """
    __tablename__ = "experiences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    experience_type = Column(String(50), nullable=False, index=True)  # education, work, volunteer, activity
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False, index=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    translations = relationship("ExperienceTranslation", back_populates="experience", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Experience {self.title} at {self.organization}>"
    
    class Config:
        from_attributes = True


class ExperienceTranslation(Base):
    """
    Experience translations for multi-language support
    """
    __tablename__ = "experience_translations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experience_id = Column(UUID(as_uuid=True), ForeignKey("experiences.id", ondelete="CASCADE"), nullable=False, index=True)
    language = Column(String(5), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    experience = relationship("Experience", back_populates="translations")
    
    def __repr__(self):
        return f"<ExperienceTranslation {self.experience_id} - {self.language}>"
    
    class Config:
        from_attributes = True
