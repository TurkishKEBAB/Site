"""
GitHub API Integration Service
Fetches repository data with Redis caching (24h)
"""

from datetime import datetime, timezone

import httpx
from typing import List, Optional, Dict, Any
from loguru import logger

from app.config import settings
from app.services.cache_service import get_cache_service

GRAPHQL_URL = "https://api.github.com/graphql"

# GitHub contributionCalendar level enum -> integer heatmap intensity.
_CONTRIB_LEVEL_MAP = {
    "NONE": 0,
    "FIRST_QUARTILE": 1,
    "SECOND_QUARTILE": 2,
    "THIRD_QUARTILE": 3,
    "FOURTH_QUARTILE": 4,
}

_STATS_QUERY = """
query($login: String!, $repoCursor: String) {
  user(login: $login) {
    createdAt
    pullRequests { totalCount }
    repositories(ownerAffiliations: OWNER, privacy: PUBLIC, first: 100,
                 after: $repoCursor,
                 orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      nodes { stargazerCount }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
"""

_CONTRIB_QUERY = """
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { contributionLevel } }
      }
    }
  }
}
"""


def _build_commit_query(start_year: int, end_year: int) -> str:
    """Build a single query aliasing per-year commit-contribution totals."""
    aliases = []
    for year in range(start_year, end_year + 1):
        aliases.append(
            f"y{year}: contributionsCollection("
            f'from: "{year}-01-01T00:00:00Z", to: "{year}-12-31T23:59:59Z") '
            f"{{ totalCommitContributions }}"
        )
    body = "\n    ".join(aliases)
    return f"query($login: String!) {{\n  user(login: $login) {{\n    {body}\n  }}\n}}"


class GitHubService:
    """Service for GitHub API integration"""

    def __init__(self):
        self.username = settings.GITHUB_USERNAME
        self.api_token = settings.GITHUB_API_TOKEN
        self.base_url = "https://api.github.com"
        self.cache = get_cache_service()
        self.cache_key = f"github_repos_{self.username}"
        self.cache_ttl = settings.GITHUB_CACHE_HOURS * 3600  # Convert hours to seconds
        self.stats_cache_key = "github_stats"
        self.contrib_cache_key = "github_contributions"

    def get_headers(self) -> Dict[str, str]:
        """Get headers for GitHub API requests"""
        headers = {
            "Accept": "application/vnd.github.v3+json",
        }

        if self.api_token:
            headers["Authorization"] = f"token {self.api_token}"

        return headers

    async def fetch_user_repos(
        self, force_refresh: bool = False
    ) -> List[Dict[str, Any]]:
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
            headers = self.get_headers()

            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/users/{self.username}/repos",
                    headers=headers,
                    params={"sort": "updated", "per_page": 100, "type": "owner"},
                    timeout=30.0,
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
                    "is_featured": repo["stargazers_count"] >= 5
                    or repo.get("homepage") is not None,
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
            headers = self.get_headers()

            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/repos/{self.username}/{repo_name}",
                    headers=headers,
                    timeout=30.0,
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
            "cache_hours": settings.GITHUB_CACHE_HOURS,
        }

    async def clear_cache(self):
        """Clear GitHub repository cache"""
        await self.cache.delete(self.cache_key)
        logger.info("GitHub repository cache cleared")

    # ------------------------------------------------------------------ #
    # GraphQL: aggregate stats + contribution calendar (Command Center)  #
    # ------------------------------------------------------------------ #

    def _graphql_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"bearer {self.api_token}",
            "Content-Type": "application/json",
        }

    async def _graphql(
        self, client: httpx.AsyncClient, query: str, variables: Dict[str, Any]
    ) -> Dict[str, Any]:
        response = await client.post(
            GRAPHQL_URL,
            headers=self._graphql_headers(),
            json={"query": query, "variables": variables},
        )
        response.raise_for_status()
        payload = response.json()
        if payload.get("errors"):
            raise RuntimeError(f"GitHub GraphQL errors: {payload['errors']}")
        return payload["data"]

    async def fetch_stats(
        self, force_refresh: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Aggregate profile stats via GraphQL: public repos, total stars,
        total PRs, and all-time commit contributions. Requires a token;
        returns None without one. Falls back to stale cache on error.
        """
        if not self.api_token:
            logger.warning("GITHUB_API_TOKEN not set; skipping GitHub stats")
            return None

        if not force_refresh:
            cached = await self.cache.get(self.stats_cache_key)
            if cached:
                logger.info("Returning cached GitHub stats")
                return cached

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                repo_cursor = None
                total_stars = 0
                user: Dict[str, Any] | None = None
                repos: Dict[str, Any] | None = None

                while True:
                    base = await self._graphql(
                        client,
                        _STATS_QUERY,
                        {"login": self.username, "repoCursor": repo_cursor},
                    )
                    user = base["user"]
                    repos = user["repositories"]
                    total_stars += sum(
                        node["stargazerCount"] for node in repos["nodes"]
                    )

                    page_info = repos.get("pageInfo") or {}
                    next_cursor = page_info.get("endCursor")
                    if not page_info.get("hasNextPage") or not next_cursor:
                        break
                    repo_cursor = next_cursor

                start_year = int(user["createdAt"][:4])
                end_year = datetime.now(timezone.utc).year
                commit_data = await self._graphql(
                    client,
                    _build_commit_query(start_year, end_year),
                    {"login": self.username},
                )
                total_commits = sum(
                    value["totalCommitContributions"]
                    for key, value in commit_data["user"].items()
                    if key.startswith("y")
                )

            stats = {
                "public_repos": repos["totalCount"],
                "total_stars": total_stars,
                "total_pull_requests": user["pullRequests"]["totalCount"],
                "total_commits": total_commits,
                "commits_range": "all_time",
            }
            await self.cache.set(self.stats_cache_key, stats, ttl=self.cache_ttl)
            logger.info("Fetched and cached GitHub stats")
            return stats

        except (httpx.HTTPError, RuntimeError, KeyError, ValueError) as e:
            logger.error(f"GitHub stats error: {e}")

        stale = await self.cache.get(self.stats_cache_key)
        if stale:
            logger.warning("Serving stale GitHub stats after fetch failure")
        return stale

    async def fetch_contributions(
        self, force_refresh: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Contribution calendar (last ~53 weeks) via GraphQL, flattened to a
        week-major list of 0..4 intensity levels for the heatmap. Requires a
        token; returns None without one. Falls back to stale cache on error.
        """
        if not self.api_token:
            logger.warning("GITHUB_API_TOKEN not set; skipping GitHub contributions")
            return None

        if not force_refresh:
            cached = await self.cache.get(self.contrib_cache_key)
            if cached:
                logger.info("Returning cached GitHub contributions")
                return cached

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                data = await self._graphql(
                    client, _CONTRIB_QUERY, {"login": self.username}
                )

            calendar = data["user"]["contributionsCollection"]["contributionCalendar"]
            cells: List[int] = [
                _CONTRIB_LEVEL_MAP.get(day["contributionLevel"], 0)
                for week in calendar["weeks"]
                for day in week["contributionDays"]
            ]
            result = {
                "total_contributions": calendar["totalContributions"],
                "cells": cells,
            }
            await self.cache.set(self.contrib_cache_key, result, ttl=self.cache_ttl)
            logger.info("Fetched and cached GitHub contributions")
            return result

        except (httpx.HTTPError, RuntimeError, KeyError, ValueError) as e:
            logger.error(f"GitHub contributions error: {e}")

        stale = await self.cache.get(self.contrib_cache_key)
        if stale:
            logger.warning("Serving stale GitHub contributions after fetch failure")
        return stale
