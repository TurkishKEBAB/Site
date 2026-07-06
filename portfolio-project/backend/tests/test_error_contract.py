"""API error contract tests."""

import asyncio
import json
from types import SimpleNamespace

from starlette.requests import Request

from app.core.errors import rate_limit_exception_handler


def _build_request() -> Request:
    return Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/rate-limited",
            "headers": [],
            "state": {},
            "app": SimpleNamespace(state=SimpleNamespace(limiter=None)),
        }
    )


def test_http_errors_use_standard_contract_and_request_id(client):
    response = client.get(
        "/api/v1/projects/missing-project",
        headers={"X-Request-ID": "req-test-123"},
    )

    assert response.status_code == 404
    assert response.headers["X-Request-ID"] == "req-test-123"

    payload = response.json()
    assert payload["success"] is False
    assert payload["detail"] == "Project not found"
    assert payload["error"] == {
        "code": "NOT_FOUND",
        "message": "Project not found",
        "request_id": "req-test-123",
    }


def test_validation_errors_use_standard_contract(client):
    response = client.post(
        "/api/v1/contact/",
        json={"name": "", "email": "invalid-email", "message": ""},
    )

    assert response.status_code == 422
    payload = response.json()
    assert payload["success"] is False
    assert payload["detail"] == "Validation Error"
    assert payload["error"]["code"] == "VALIDATION_ERROR"
    assert payload["error"]["message"] == "Validation Error"
    assert "email" in payload["error"]["fields"]


def test_rate_limit_handler_preserves_exception_headers():
    request = _build_request()
    request.state.request_id = "req-rate-1"
    exc = SimpleNamespace(
        detail="1 per minute",
        headers={"Retry-After": "60", "X-RateLimit-Limit": "1"},
    )

    response = asyncio.run(rate_limit_exception_handler(request, exc))

    assert response.status_code == 429
    assert response.headers["retry-after"] == "60"
    assert response.headers["x-ratelimit-limit"] == "1"

    payload = json.loads(response.body)
    assert payload["success"] is False
    assert payload["detail"] == "1 per minute"
    assert payload["error"] == {
        "code": "RATE_LIMITED",
        "message": "Rate limit exceeded",
        "request_id": "req-rate-1",
    }


def test_rate_limit_handler_keeps_slowapi_injected_headers():
    class DummyLimiter:
        def _inject_headers(self, response, view_rate_limit):
            response.headers["X-RateLimit-Remaining"] = str(view_rate_limit)
            return response

    request = _build_request()
    request.state.view_rate_limit = 0
    request.scope["app"].state.limiter = DummyLimiter()
    exc = SimpleNamespace(detail=None, headers=None)

    response = asyncio.run(rate_limit_exception_handler(request, exc))

    assert response.status_code == 429
    assert response.headers["x-ratelimit-remaining"] == "0"
    payload = json.loads(response.body)
    assert payload["detail"] == "Rate limit exceeded"
