"""System health endpoint tests."""

import asyncio
from pathlib import Path

from app import main as main_module


class DummyCache:
    redis_client = None
    backend = "memory"

    def __init__(self, calls):
        self._calls = calls

    async def connect(self):
        self._calls.append("cache-connect")

    async def disconnect(self):
        self._calls.append("cache-disconnect")


def test_live_endpoint_returns_alive(client):
    response = client.get("/live")
    assert response.status_code == 200
    assert response.json()["status"] == "alive"


def test_container_healthcheck_uses_liveness_endpoint():
    dockerfile = Path(__file__).resolve().parents[1] / "Dockerfile"
    contents = dockerfile.read_text(encoding="utf-8")

    assert "/live" in contents
    assert "/health" not in contents


def test_ready_returns_503_when_db_down(client, monkeypatch):
    monkeypatch.setattr("app.main.check_db_connection", lambda: False)
    response = client.get("/ready")
    assert response.status_code == 503
    assert response.json()["status"] == "not_ready"


def test_health_returns_degraded_when_db_down(client, monkeypatch):
    monkeypatch.setattr("app.main.check_db_connection", lambda: False)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "degraded"


def test_cors_preflight_allows_frontend_methods(client):
    allowed_methods = {"GET", "POST", "PUT", "PATCH", "DELETE"}

    for method in allowed_methods:
        response = client.options(
            "/api/v1/projects/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": method,
            },
        )

        assert response.status_code == 200
        allowed_header = response.headers["access-control-allow-methods"]
        assert method in allowed_header


def test_cors_preflight_rejects_unlisted_methods(client):
    response = client.options(
        "/api/v1/projects/",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "TRACE",
        },
    )

    assert response.status_code == 400


def test_lifespan_initializes_observability_during_startup(monkeypatch):
    calls = []

    monkeypatch.setattr(
        main_module,
        "init_observability",
        lambda: calls.append("observability"),
    )
    monkeypatch.setattr(main_module, "check_db_connection", lambda: True)
    monkeypatch.setattr(
        main_module,
        "get_cache_service",
        lambda: DummyCache(calls),
    )

    async def run_lifespan():
        async with main_module.lifespan(main_module.app):
            assert calls == ["observability", "cache-connect"]

        assert calls == [
            "observability",
            "cache-connect",
            "cache-disconnect",
        ]

    asyncio.run(run_lifespan())
