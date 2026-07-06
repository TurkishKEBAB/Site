"""GitHub endpoint tests."""

import asyncio
from datetime import datetime


def _mock_repo(name="repo-one", stars=10):
    return {
        "repo_name": name,
        "full_name": f"owner/{name}",
        "description": "Repository",
        "url": f"https://github.com/owner/{name}",
        "homepage": None,
        "stars": stars,
        "forks": 2,
        "watchers": 5,
        "language": "Python",
        "topics": ["api"],
        "last_updated": datetime(2026, 1, 1, 0, 0, 0),
        "is_featured": stars >= 5,
    }


def test_get_repos_refreshes_cache_when_invalid(client, monkeypatch, admin_headers):
    class DummyGitHubService:
        async def fetch_user_repos(self, force_refresh=False):
            return [_mock_repo("repo-one", 12), _mock_repo("repo-two", 3)]

    monkeypatch.setattr("app.api.v1.github.GitHubService", DummyGitHubService)

    response = client.get(
        "/api/v1/github/repos?force_refresh=true", headers=admin_headers
    )

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 2
    assert payload[0]["repo_name"] == "repo-one"


def test_get_repos_featured_filter(client, monkeypatch, admin_headers):
    class DummyGitHubService:
        async def fetch_user_repos(self, force_refresh=False):
            return [_mock_repo("featured", 10), _mock_repo("small", 1)]

    monkeypatch.setattr("app.api.v1.github.GitHubService", DummyGitHubService)
    client.get("/api/v1/github/repos?force_refresh=true", headers=admin_headers)

    featured_only = client.get("/api/v1/github/repos?featured_only=true")
    assert featured_only.status_code == 200
    assert len(featured_only.json()) == 1
    assert featured_only.json()[0]["repo_name"] == "featured"


def test_force_refresh_requires_admin(client, user_headers):
    unauth = client.get("/api/v1/github/repos?force_refresh=true")
    forbidden = client.get(
        "/api/v1/github/repos?force_refresh=true", headers=user_headers
    )

    assert unauth.status_code == 401
    assert forbidden.status_code == 403


def test_sync_requires_admin(client, user_headers):
    unauth = client.post("/api/v1/github/sync")
    forbidden = client.post("/api/v1/github/sync", headers=user_headers)

    assert unauth.status_code == 401
    assert forbidden.status_code == 403


def test_sync_success_and_not_found(client, admin_headers, monkeypatch):
    class SuccessService:
        async def fetch_user_repos(self, force_refresh=False):
            return [_mock_repo("sync-repo", 7)]

    monkeypatch.setattr("app.api.v1.github.GitHubService", SuccessService)
    success = client.post("/api/v1/github/sync", headers=admin_headers)
    assert success.status_code == 200
    assert success.json()["updated"] == 1

    class EmptyService:
        async def fetch_user_repos(self, force_refresh=False):
            return []

    monkeypatch.setattr("app.api.v1.github.GitHubService", EmptyService)
    not_found = client.post("/api/v1/github/sync", headers=admin_headers)
    assert not_found.status_code == 404


def test_cache_status_and_clear_cache(client, admin_headers, monkeypatch):
    class DummyGitHubService:
        async def fetch_user_repos(self, force_refresh=False):
            return [_mock_repo("cached", 6)]

    monkeypatch.setattr("app.api.v1.github.GitHubService", DummyGitHubService)
    client.get("/api/v1/github/repos?force_refresh=true", headers=admin_headers)

    cache_status = client.get("/api/v1/github/cache-status")
    clear = client.delete("/api/v1/github/cache", headers=admin_headers)
    cache_status_after = client.get("/api/v1/github/cache-status")

    assert cache_status.status_code == 200
    assert cache_status.json()["cache_exists"] is True
    assert clear.status_code == 204
    assert cache_status_after.json()["cache_exists"] is False


def test_get_github_stats(client, monkeypatch):
    class DummyGitHubService:
        async def fetch_stats(self, force_refresh=False):
            return {
                "public_repos": 32,
                "total_stars": 47,
                "total_pull_requests": 86,
                "total_commits": 2400,
                "commits_range": "all_time",
            }

    monkeypatch.setattr("app.api.v1.github.GitHubService", DummyGitHubService)

    response = client.get("/api/v1/github/stats")

    assert response.status_code == 200
    payload = response.json()
    assert payload["public_repos"] == 32
    assert payload["total_commits"] == 2400


def test_get_github_stats_unavailable(client, monkeypatch):
    class DummyGitHubService:
        async def fetch_stats(self, force_refresh=False):
            return None

    monkeypatch.setattr("app.api.v1.github.GitHubService", DummyGitHubService)

    assert client.get("/api/v1/github/stats").status_code == 503


def test_get_github_contributions(client, monkeypatch):
    class DummyGitHubService:
        async def fetch_contributions(self, force_refresh=False):
            return {"total_contributions": 1234, "cells": [0, 1, 2, 3, 4]}

    monkeypatch.setattr("app.api.v1.github.GitHubService", DummyGitHubService)

    response = client.get("/api/v1/github/contributions")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total_contributions"] == 1234
    assert payload["cells"] == [0, 1, 2, 3, 4]


def test_build_commit_query_aliases_years():
    from app.services.github_service import _build_commit_query

    query = _build_commit_query(2023, 2025)

    assert "y2023:" in query
    assert "y2024:" in query
    assert "y2025:" in query
    assert '"2025-12-31T23:59:59Z"' in query


def test_github_stats_paginates_repo_stars(monkeypatch):
    from app.services.github_service import GitHubService

    class DummyCache:
        def __init__(self):
            self.saved = None

        async def get(self, key):
            return None

        async def set(self, key, value, ttl):
            self.saved = (key, value, ttl)

    service = GitHubService()
    service.api_token = "github-token"
    service.username = "TurkishKEBAB"
    service.cache = DummyCache()

    repo_cursors = []

    async def fake_graphql(client, query, variables):
        if "repositories" in query:
            repo_cursors.append(variables["repoCursor"])
            if variables["repoCursor"] is None:
                return {
                    "user": {
                        "createdAt": "2025-01-01T00:00:00Z",
                        "pullRequests": {"totalCount": 2},
                        "repositories": {
                            "totalCount": 101,
                            "nodes": [{"stargazerCount": 3}, {"stargazerCount": 5}],
                            "pageInfo": {
                                "hasNextPage": True,
                                "endCursor": "cursor-2",
                            },
                        },
                    }
                }
            return {
                "user": {
                    "createdAt": "2025-01-01T00:00:00Z",
                    "pullRequests": {"totalCount": 2},
                    "repositories": {
                        "totalCount": 101,
                        "nodes": [{"stargazerCount": 7}],
                        "pageInfo": {"hasNextPage": False, "endCursor": None},
                    },
                }
            }

        return {"user": {"y2025": {"totalCommitContributions": 11}}}

    monkeypatch.setattr(service, "_graphql", fake_graphql)

    stats = asyncio.run(service.fetch_stats(force_refresh=True))

    assert repo_cursors == [None, "cursor-2"]
    assert stats["public_repos"] == 101
    assert stats["total_stars"] == 15
    assert stats["total_pull_requests"] == 2
    assert stats["total_commits"] == 11
    assert service.cache.saved[1] == stats
