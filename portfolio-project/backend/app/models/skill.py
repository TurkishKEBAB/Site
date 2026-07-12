"""
Skill Models
Skills with domain (capability group) + ring (tech-radar) and translations
"""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Skill(Base):
    """
    Skill model aligned with the public site.
    `domain` is the CapabilityMatrix group (backend/cloud/product/testing/research);
    `ring` is the TechRadar ring (adopt/trial/assess/hold). `category` is a free-form
    label (e.g. "Programming Languages").
    """
    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    domain = Column(String(50), nullable=False, server_default="backend", index=True)  # capability group
    ring = Column(String(20), nullable=False, server_default="assess")  # tech-radar ring
    icon = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    translations = relationship("SkillTranslation", back_populates="skill", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Skill {self.name} - {self.domain}/{self.ring}>"
    
    class Config:
        from_attributes = True


class SkillTranslation(Base):
    """
    Skill translations for multi-language support
    """
    __tablename__ = "skill_translations"
    __table_args__ = (UniqueConstraint("skill_id", "language", name="uq_skill_translations"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    language = Column(String(5), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    skill = relationship("Skill", back_populates="translations")
    
    def __repr__(self):
        return f"<SkillTranslation {self.skill_id} - {self.language}>"
    
    class Config:
        from_attributes = True
