"""API error contract tests."""


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
