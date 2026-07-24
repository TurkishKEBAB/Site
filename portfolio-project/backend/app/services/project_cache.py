"""Shared cache controls for public project-list responses."""

from app.services.cache_service import CacheService, get_cache_service

PROJECT_LIST_CACHE_VERSION_KEY = "projects:list:version"
PROJECT_LIST_CACHE_TTL_SECONDS = 300


async def invalidate_project_list_cache(
    cache_service: CacheService | None = None,
) -> None:
    """Make all cached project-list variants stale after a content mutation."""
    cache = cache_service or get_cache_service()
    await cache.increment(PROJECT_LIST_CACHE_VERSION_KEY)
