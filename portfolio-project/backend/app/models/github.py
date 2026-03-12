"""
GitHub Repository Model
Cached GitHub repository data
"""
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database import Base


class GitHubRepo(Base):
    """
    GitHub repository cache model
    Stores GitHub API data with 24-hour caching
    """
    __tablename__ = "github_repos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    repo_name = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(500), nullable=False)
    homepage = Column(String(500), nullable=True)
    stars = Column(Integer, default=0, index=True)
    forks = Column(Integer, default=0)
    watchers = Column(Integer, default=0)
    language = Column(String(50), nullable=True)
    topics = Column(JSON, nullable=True)  # Portable list-like storage across DB engines
    last_updated = Column(DateTime(timezone=True), nullable=True)
    cached_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    is_featured = Column(Boolean, default=False, index=True)
    
    def __repr__(self):
        return f"<GitHubRepo {self.repo_name} ⭐{self.stars}>"
    
    class Config:
        from_attributes = True
