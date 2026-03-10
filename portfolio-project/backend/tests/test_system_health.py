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


def test_health_returns_degraded_with_http_200_when_db_down(client, monkeypatch):
    monkeypatch.setattr("app.main.check_db_connection", lambda: False)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "degraded"
