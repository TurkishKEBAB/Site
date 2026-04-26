"""System health endpoint tests."""


def test_live_endpoint_returns_alive(client):
    response = client.get("/live")
    assert response.status_code == 200
    assert response.json()["status"] == "alive"


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
