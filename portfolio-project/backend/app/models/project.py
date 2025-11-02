"""
Project Models
Portfolio projects with translations and technologies
"""
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Project(Base):
    """
    Portfolio project model
    """
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    short_description = Column(Text, nullable=True)
    description = Column(Text, nullable=False)
    cover_image = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    demo_url = Column(String(500), nullable=True)
    featured = Column(Boolean, default=False, index=True)
    display_order = Column(Integer, default=0, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    translations = relationship("ProjectTranslation", back_populates="project", cascade="all, delete-orphan")
    project_technologies = relationship("ProjectTechnology", back_populates="project", cascade="all, delete-orphan")
    images = relationship("ProjectImage", back_populates="project", cascade="all, delete-orphan")
    # Direct relationship to technologies through association table
    technologies = relationship(
        "Technology",
        secondary="project_technologies",
        viewonly=True
    )
    
    def __repr__(self):
        return f"<Project {self.slug}>"
    
    class Config:
        from_attributes = True


class ProjectTranslation(Base):
    """
    Project translations for multi-language support
    """
    __tablename__ = "project_translations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    language = Column(String(5), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    short_description = Column(Text, nullable=True)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="translations")
    
    def __repr__(self):
        return f"<ProjectTranslation {self.project_id} - {self.language}>"
    
    class Config:
        from_attributes = True


class ProjectTechnology(Base):
    """
    Many-to-many relationship between projects and technologies
    """
    __tablename__ = "project_technologies"
    
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True, index=True)
    technology_id = Column(UUID(as_uuid=True), ForeignKey("technologies.id", ondelete="CASCADE"), primary_key=True, index=True)
    
    # Relationships
    project = relationship("Project", back_populates="project_technologies")
    technology = relationship("Technology", back_populates="project_technologies")
    
    def __repr__(self):
        return f"<ProjectTechnology project={self.project_id} tech={self.technology_id}>"
    
    class Config:
        from_attributes = True


class ProjectImage(Base):
    """
    Project image gallery
    """
    __tablename__ = "project_images"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    caption = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="images")
    
    def __repr__(self):
        return f"<ProjectImage {self.id}>"
    
    class Config:
        from_attributes = True
