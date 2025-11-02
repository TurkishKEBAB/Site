"""
Technology Model
Programming languages, frameworks, tools, etc.
"""
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Technology(Base):
    """
    Technology/Tool model (Java, Python, Docker, AWS, etc.)
    """
    __tablename__ = "technologies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    icon = Column(String(500), nullable=True)  # URL or icon class (e.g., devicon)
    category = Column(String(50), nullable=True, index=True)  # language, framework, tool, cloud, database
    color = Column(String(7), nullable=True)  # Hex color for UI (#3B82F6)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project_technologies = relationship("ProjectTechnology", back_populates="technology", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Technology {self.name}>"
    
    class Config:
        from_attributes = True
