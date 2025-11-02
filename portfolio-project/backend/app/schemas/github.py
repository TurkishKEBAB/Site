"""
GitHub Repository Schemas
GitHub API integration and caching
"""
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
import uuid


class GitHubRepoBase(BaseModel):
    """Base GitHub repository schema"""
    repo_name: str
    full_name: str
    description: Optional[str] = None
    url: HttpUrl
    homepage: Optional[HttpUrl] = None
    stars: int = 0
    forks: int = 0
    watchers: int = 0
    language: Optional[str] = None
    topics: List[str] = []
    last_updated: Optional[datetime] = None
    is_featured: bool = False


class GitHubRepo(GitHubRepoBase):
    """GitHub repository response schema"""
    id: uuid.UUID
    cached_at: datetime
    
    class Config:
        from_attributes = True


class GitHubRepoResponse(BaseModel):
    """GitHub repositories list response"""
    total: int
    cached_at: datetime
    cache_expires_in: int  # seconds until cache expires
    repositories: List[GitHubRepo]


class GitHubRefreshResponse(BaseModel):
    """Response after manually refreshing GitHub cache"""
    success: bool
    message: str
    fetched: int
    updated: int


# Alias for backward compatibility  
GitHubSyncResponse = GitHubRefreshResponse
