"""
GitHub Integration Endpoints
GitHub repository fetching and caching
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.schemas.github import GitHubRepoResponse, GitHubSyncResponse
from app.crud import github as github_crud
from app.services.github_service import GitHubService
from app.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/repos", response_model=List[GitHubRepoResponse])
async def get_github_repos(
    limit: int = Query(20, ge=1, le=50),
    featured_only: bool = False,
    force_refresh: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get GitHub repositories
    Returns cached data unless force_refresh is True
    """
    # Check if cache is valid
    cache_valid = github_crud.is_cache_valid(db, cache_hours=24)

    if not cache_valid or force_refresh:
        # Fetch fresh data from GitHub
        github_service = GitHubService()
        fresh_repos = await github_service.fetch_user_repos(
            username=settings.GITHUB_USERNAME,
            force_refresh=force_refresh
        )

        # Update database cache
        if fresh_repos:
            github_crud.bulk_create_or_update_repos(db, fresh_repos)

    # Return data from database
    return github_crud.get_github_repos(db, limit=limit, featured_only=featured_only)


@router.post("/sync", response_model=GitHubSyncResponse)
async def sync_github_repos(
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Force sync GitHub repositories (admin only)
    Fetches latest data from GitHub and updates cache
    """
    github_service = GitHubService()

    try:
        repos = await github_service.fetch_user_repos(
            username=settings.GITHUB_USERNAME,
            force_refresh=True
        )

        if not repos:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No repositories found"
            )

        # Update database
        count = github_crud.bulk_create_or_update_repos(db, repos)

        return {
            "success": True,
            "synced_count": count,
            "message": f"Successfully synced {count} repositories"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"GitHub sync failed: {str(e)}"
        )


@router.get("/cache-status")
async def get_cache_status(
    db: Session = Depends(get_db)
):
    """
    Get GitHub cache status
    """
    cache_age = github_crud.get_cache_age(db)
    cache_valid = github_crud.is_cache_valid(db, cache_hours=24)

    return {
        "cache_valid": cache_valid,
        "cache_age_hours": cache_age.total_seconds() / 3600 if cache_age else None,
        "cache_exists": cache_age is not None
    }


@router.delete("/cache", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cache(
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Clear GitHub repository cache (admin only)
    """
    github_crud.clear_github_cache(db)
    return None
