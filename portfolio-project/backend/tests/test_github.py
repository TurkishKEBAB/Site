"""GitHub endpoint tests."""

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


def test_get_repos_refreshes_cache_when_invalid(client, monkeypatch):
    class DummyGitHubService:
        async def fetch_user_repos(self, force_refresh=False):
            return [_mock_repo("repo-one", 12), _mock_repo("repo-two", 3)]

    monkeypatch.setattr("app.api.v1.github.GitHubService", DummyGitHubService)

    response = client.get("/api/v1/github/repos?force_refresh=true")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 2
    assert payload[0]["repo_name"] == "repo-one"


def test_get_repos_featured_filter(client, monkeypatch):
    class DummyGitHubService:
        async def fetch_user_repos(self, force_refresh=False):
            return [_mock_repo("featured", 10), _mock_repo("small", 1)]

    monkeypatch.setattr("app.api.v1.github.GitHubService", DummyGitHubService)
    client.get("/api/v1/github/repos?force_refresh=true")

    featured_only = client.get("/api/v1/github/repos?featured_only=true")
    assert featured_only.status_code == 200
    assert len(featured_only.json()) == 1
    assert featured_only.json()[0]["repo_name"] == "featured"


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
    client.get("/api/v1/github/repos?force_refresh=true")

    cache_status = client.get("/api/v1/github/cache-status")
    clear = client.delete("/api/v1/github/cache", headers=admin_headers)
    cache_status_after = client.get("/api/v1/github/cache-status")

    assert cache_status.status_code == 200
    assert cache_status.json()["cache_exists"] is True
    assert clear.status_code == 204
    assert cache_status_after.json()["cache_exists"] is False
