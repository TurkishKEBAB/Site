"""
GitHub Repository CRUD Operations
GitHub repository caching management
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from app.models.github import GitHubRepo


def get_github_repos(
    db: Session,
    limit: int = 20,
    featured_only: bool = False
) -> List[GitHubRepo]:
    """
    Get list of GitHub repositories
    
    Args:
        db: Database session
        limit: Maximum number of repositories to return
        featured_only: Only return featured repositories
        
    Returns:
        List of GitHub repositories
    """
    query = db.query(GitHubRepo)
    
    if featured_only:
        query = query.filter(GitHubRepo.is_featured == True)
    
    query = query.order_by(GitHubRepo.stars.desc(), GitHubRepo.last_updated.desc())
    
    return query.limit(limit).all()


def get_github_repo_by_name(db: Session, repo_name: str) -> Optional[GitHubRepo]:
    """Get GitHub repository by name"""
    return db.query(GitHubRepo).filter(GitHubRepo.repo_name == repo_name).first()


def create_or_update_github_repo(db: Session, repo_data: dict) -> GitHubRepo:
    """
    Create or update a GitHub repository
    
    Args:
        db: Database session
        repo_data: Repository data dictionary
        
    Returns:
        Created or updated repository
    """
    existing = get_github_repo_by_name(db, repo_data["repo_name"])
    
    if existing:
        # Update existing repository
        for key, value in repo_data.items():
            if key != "cached_at":  # Don't update cached_at from repo_data
                setattr(existing, key, value)
        existing.cached_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new repository
        db_repo = GitHubRepo(**repo_data, cached_at=datetime.utcnow())
        db.add(db_repo)
        db.commit()
        db.refresh(db_repo)
        return db_repo


def bulk_create_or_update_repos(db: Session, repos_data: List[dict]) -> int:
    """
    Create or update multiple GitHub repositories
    
    Args:
        db: Database session
        repos_data: List of repository data dictionaries
        
    Returns:
        Number of repositories processed
    """
    count = 0
    for repo_data in repos_data:
        create_or_update_github_repo(db, repo_data)
        count += 1
    
    return count


def is_cache_valid(db: Session, cache_hours: int = 24) -> bool:
    """
    Check if GitHub cache is still valid
    
    Args:
        db: Database session
        cache_hours: Number of hours cache is valid
        
    Returns:
        True if cache is valid
    """
    latest = db.query(GitHubRepo).order_by(GitHubRepo.cached_at.desc()).first()
    
    if not latest:
        return False
    
    expiry_time = latest.cached_at + timedelta(hours=cache_hours)
    return datetime.utcnow() < expiry_time


def get_cache_age(db: Session) -> Optional[timedelta]:
    """
    Get age of the GitHub cache
    
    Returns:
        Timedelta representing cache age, or None if no cache
    """
    latest = db.query(GitHubRepo).order_by(GitHubRepo.cached_at.desc()).first()
    
    if not latest:
        return None
    
    return datetime.utcnow() - latest.cached_at


def clear_github_cache(db: Session) -> int:
    """
    Clear all GitHub repositories from cache
    
    Returns:
        Number of repositories deleted
    """
    count = db.query(func.count(GitHubRepo.id)).scalar()
    db.query(GitHubRepo).delete()
    db.commit()
    
    return count
