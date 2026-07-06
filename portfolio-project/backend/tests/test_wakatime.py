"""WakaTime endpoint and service tests."""

import asyncio
import base64

from app.services.wakatime_service import WakaTimeService


def _mock_stats():
    return {
        "all_time_seconds": 4467600,
        "all_time_text": "1,240 hrs",
        "last_7_days_seconds": 66600,
        "last_7_days_text": "18 hrs 30 mins",
        "daily_average_seconds": 15120,
        "daily_average_text": "4 hrs 12 mins",
        "languages": [
            {"name": "Python", "percent": 34.2},
            {"name": "TypeScript", "percent": 20.1},
        ],
        "range": "last_7_days",
    }


def test_get_wakatime_stats(client, monkeypatch):
    class DummyWakaTimeService:
        async def fetch_stats(self, force_refresh=False):
            return _mock_stats()

    monkeypatch.setattr("app.api.v1.wakatime.WakaTimeService", DummyWakaTimeService)

    response = client.get("/api/v1/wakatime/stats")

    assert response.status_code == 200
    payload = response.json()
    assert payload["all_time_seconds"] == 4467600
    assert payload["languages"][0]["name"] == "Python"


def test_get_wakatime_stats_unavailable(client, monkeypatch):
    class DummyWakaTimeService:
        async def fetch_stats(self, force_refresh=False):
            return None

    monkeypatch.setattr("app.api.v1.wakatime.WakaTimeService", DummyWakaTimeService)

    response = client.get("/api/v1/wakatime/stats")

    assert response.status_code == 503


def test_summarize_languages_folds_into_other():
    languages = [
        {"name": "Python", "percent": 30},
        {"name": "Java", "percent": 25},
        {"name": "TypeScript", "percent": 20},
        {"name": "Go", "percent": 10},
        {"name": "Bash", "percent": 8},
        {"name": "YAML", "percent": 4},
        {"name": "JSON", "percent": 3},
    ]

    result = WakaTimeService._summarize_languages(languages)

    assert len(result) == 6  # top 5 + Other
    assert result[0]["name"] == "Python"
    assert result[-1] == {"name": "Other", "percent": 7.0}


def test_get_headers_uses_wakatime_basic_auth_username_format():
    service = WakaTimeService()
    service.api_key = "waka-secret"

    expected = base64.b64encode(b"waka-secret:").decode("ascii")

    assert service.get_headers() == {"Authorization": f"Basic {expected}"}


def test_pending_wakatime_stats_are_not_cached(monkeypatch):
    stale_stats = _mock_stats()

    class DummyCache:
        def __init__(self):
            self.set_calls = []

        async def get(self, key):
            return stale_stats

        async def set(self, key, value, ttl):
            self.set_calls.append((key, value, ttl))

    class DummyResponse:
        def __init__(self, status_code, payload):
            self.status_code = status_code
            self._payload = payload

        def raise_for_status(self):
            return None

        def json(self):
            return self._payload

    class DummyAsyncClient:
        def __init__(self, *args, **kwargs):
            self.calls = 0

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, traceback):
            return False

        async def get(self, url, headers):
            self.calls += 1
            if "all_time_since_today" in url:
                return DummyResponse(
                    200,
                    {"data": {"total_seconds": 1000, "text": "16 mins"}},
                )
            return DummyResponse(202, {"data": {"is_up_to_date": False}})

    monkeypatch.setattr(
        "app.services.wakatime_service.httpx.AsyncClient", DummyAsyncClient
    )

    cache = DummyCache()
    service = WakaTimeService()
    service.api_key = "waka-secret"
    service.cache = cache

    result = asyncio.run(service.fetch_stats(force_refresh=True))

    assert result == stale_stats
    assert cache.set_calls == []
