"""
GitHub API Integration Service
Fetches repository data with Redis caching (24h)
"""
import httpx
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from loguru import logger

from app.config import settings
from app.services.cache_service import CacheService


class GitHubService:
    """Service for GitHub API integration"""
    
    def __init__(self):
        self.username = settings.GITHUB_USERNAME
        self.api_token = settings.GITHUB_API_TOKEN
        self.base_url = "https://api.github.com"
        self.cache = CacheService()
        self.cache_key = f"github_repos_{self.username}"
        self.cache_ttl = settings.GITHUB_CACHE_HOURS * 3600  # Convert hours to seconds
    
    async def get_headers(self) -> Dict[str, str]:
        """Get headers for GitHub API requests"""
        headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        
        if self.api_token:
            headers["Authorization"] = f"token {self.api_token}"
        
        return headers
    
    async def fetch_user_repos(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Fetch user repositories from GitHub API
        
        Args:
            force_refresh: If True, bypass cache and fetch fresh data
            
        Returns:
            List of repository data dictionaries
        """
        # Check cache first (unless force refresh)
        if not force_refresh:
            cached_repos = await self.cache.get(self.cache_key)
            if cached_repos:
                logger.info(f"Returning cached GitHub repos for {self.username}")
                return cached_repos
        
        logger.info(f"Fetching GitHub repos for {self.username} from API")
        
        try:
            headers = await self.get_headers()
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/users/{self.username}/repos",
                    headers=headers,
                    params={
                        "sort": "updated",
                        "per_page": 100,
                        "type": "owner"
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                repos = response.json()
            
            # Process repository data
            processed_repos = []
            for repo in repos:
                processed_repo = {
                    "repo_name": repo["name"],
                    "full_name": repo["full_name"],
                    "description": repo.get("description"),
                    "url": repo["html_url"],
                    "homepage": repo.get("homepage"),
                    "stars": repo["stargazers_count"],
                    "forks": repo["forks_count"],
                    "watchers": repo["watchers_count"],
                    "language": repo.get("language"),
                    "topics": repo.get("topics", []),
                    "last_updated": repo.get("updated_at"),
                    "is_featured": repo["stargazers_count"] >= 5 or repo.get("homepage") is not None
                }
                processed_repos.append(processed_repo)
            
            # Sort by stars (descending)
            processed_repos.sort(key=lambda x: x["stars"], reverse=True)
            
            # Cache the results
            await self.cache.set(self.cache_key, processed_repos, ttl=self.cache_ttl)
            
            logger.info(f"Fetched and cached {len(processed_repos)} GitHub repos")
            return processed_repos
        
        except httpx.HTTPError as e:
            logger.error(f"GitHub API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error fetching GitHub repos: {e}")
            raise
    
    async def get_repo_details(self, repo_name: str) -> Optional[Dict[str, Any]]:
        """
        Fetch detailed information for a specific repository
        
        Args:
            repo_name: Repository name
            
        Returns:
            Repository data dictionary or None
        """
        try:
            headers = await self.get_headers()
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/repos/{self.username}/{repo_name}",
                    headers=headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        
        except httpx.HTTPError as e:
            logger.error(f"Error fetching repo {repo_name}: {e}")
            return None
    
    async def get_cache_status(self) -> Dict[str, Any]:
        """
        Get cache status information
        
        Returns:
            Dictionary with cache status
        """
        cached_repos = await self.cache.get(self.cache_key)
        ttl = await self.cache.ttl(self.cache_key)
        
        return {
            "cached": cached_repos is not None,
            "count": len(cached_repos) if cached_repos else 0,
            "expires_in": ttl if ttl > 0 else 0,
            "cache_hours": settings.GITHUB_CACHE_HOURS
        }
    
    async def clear_cache(self):
        """Clear GitHub repository cache"""
        await self.cache.delete(self.cache_key)
        logger.info("GitHub repository cache cleared")
