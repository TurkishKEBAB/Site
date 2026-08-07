"""
GitHub Repository Schemas
GitHub API integration and caching
"""
from pydantic import BaseModel, HttpUrl, ConfigDict
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
    
    model_config = ConfigDict(from_attributes=True)


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


class GitHubLanguage(BaseModel):
    """Repository language share calculated from the live GitHub profile."""

    name: str
    percent: float


class GitHubStats(BaseModel):
    """Aggregate GitHub profile stats for the Command Center."""
    public_repos: int
    total_stars: int
    total_pull_requests: int
    total_commits: int
    commits_range: str
    languages: List[GitHubLanguage] = []


class GitHubContributions(BaseModel):
    """Contribution calendar flattened to week-major 0..4 heatmap levels."""
    total_contributions: int
    cells: List[int]
    current_streak: int = 0
    longest_streak: int = 0
    last_contribution: Optional[str] = None
