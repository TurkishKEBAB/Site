"""WakaTime endpoint and service tests."""

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
