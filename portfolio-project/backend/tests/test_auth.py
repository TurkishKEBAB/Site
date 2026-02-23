from datetime import timedelta

from app.utils.security import create_access_token


def test_login_json_success(client, admin_user):
    response = client.post(
        "/api/v1/auth/login/json",
        json={"email": admin_user.email, "password": "testpass123"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert "access_token" in payload
    assert payload["token_type"] == "bearer"
    assert isinstance(payload.get("expires_in"), int)


def test_login_json_invalid_credentials(client, admin_user):
    response = client.post(
        "/api/v1/auth/login/json",
        json={"email": admin_user.email, "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_form_success(client, admin_user):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": admin_user.email, "password": "testpass123"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert "access_token" in body


def test_login_json_rate_limit(client, admin_user):
    for _ in range(5):
        ok = client.post(
            "/api/v1/auth/login/json",
            json={"email": admin_user.email, "password": "testpass123"},
        )
        assert ok.status_code == 200

    blocked = client.post(
        "/api/v1/auth/login/json",
        json={"email": admin_user.email, "password": "testpass123"},
    )

    assert blocked.status_code == 429


def test_get_current_user_success(client, admin_headers, admin_user):
    response = client.get("/api/v1/auth/me", headers=admin_headers)

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(admin_user.id)
    assert body["email"] == admin_user.email


def test_get_current_user_invalid_token(client):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid-token"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"


def test_get_current_user_expired_token(client, admin_user):
    expired_token = create_access_token(
        data={"sub": str(admin_user.id)},
        expires_delta=timedelta(minutes=-1),
    )

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )

    assert response.status_code == 401


def test_verify_token_success(client, admin_headers, admin_user):
    response = client.post("/api/v1/auth/verify-token", headers=admin_headers)

    assert response.status_code == 200
    body = response.json()
    assert body["valid"] is True
    assert body["user"]["id"] == str(admin_user.id)
    assert body["user"]["is_admin"] is True


def test_refresh_token_success(client, admin_headers):
    response = client.post("/api/v1/auth/refresh", headers=admin_headers)

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert "access_token" in body


def test_register_requires_authentication(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "new-user@test.com",
            "username": "newuser",
            "password": "newpass123",
        },
    )

    assert response.status_code == 401


def test_register_forbidden_for_regular_user(client, user_headers):
    response = client.post(
        "/api/v1/auth/register",
        headers=user_headers,
        json={
            "email": "new-user@test.com",
            "username": "newuser",
            "password": "newpass123",
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Not enough permissions. Admin access required."


def test_register_duplicate_email(client, admin_headers, admin_user):
    response = client.post(
        "/api/v1/auth/register",
        headers=admin_headers,
        json={
            "email": admin_user.email,
            "username": "another-user",
            "password": "newpass123",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_register_success(client, admin_headers):
    response = client.post(
        "/api/v1/auth/register",
        headers=admin_headers,
        json={
            "email": "new-user@test.com",
            "username": "newuser",
            "password": "newpass123",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "new-user@test.com"
    assert body["username"] == "newuser"
