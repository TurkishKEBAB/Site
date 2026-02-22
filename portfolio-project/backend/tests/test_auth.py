"""Authentication endpoint tests."""
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models as app_models  # noqa: F401
from app.main import app
from app.database import Base
from app.api.deps import get_db
from app.core.rate_limit import limiter
from app.crud import user as user_crud
from app.schemas.user import UserCreate


def _build_test_client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    user = user_crud.create_user(
        db,
        UserCreate(
            email="admin@test.com",
            username="testadmin",
            password="testpass123",
            full_name="Test Admin",
            is_admin=True,
            is_active=True,
        ),
    )
    db.commit()

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    return client, db, engine, user


def _cleanup(client, db, engine):
    app.dependency_overrides.clear()
    client.close()
    db.close()
    Base.metadata.drop_all(bind=engine)


def test_login_json_success():
    limiter._storage.reset()
    client, db, engine, user = _build_test_client()
    try:
        response = client.post(
            "/api/v1/auth/login/json",
            json={"email": user.email, "password": "testpass123"},
        )
        assert response.status_code == 200
        payload = response.json()
        assert "access_token" in payload
        assert payload["token_type"] == "bearer"
        assert isinstance(payload.get("expires_in"), int)
    finally:
        _cleanup(client, db, engine)


def test_login_json_invalid_credentials():
    limiter._storage.reset()
    client, db, engine, user = _build_test_client()
    try:
        response = client.post(
            "/api/v1/auth/login/json",
            json={"email": user.email, "password": "wrong-password"},
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect email or password"
    finally:
        _cleanup(client, db, engine)


def test_login_json_rate_limit():
    limiter._storage.reset()
    client, db, engine, user = _build_test_client()
    try:
        for _ in range(5):
            ok = client.post(
                "/api/v1/auth/login/json",
                json={"email": user.email, "password": "testpass123"},
            )
            assert ok.status_code == 200

        blocked = client.post(
            "/api/v1/auth/login/json",
            json={"email": user.email, "password": "testpass123"},
        )
        assert blocked.status_code == 429
    finally:
        _cleanup(client, db, engine)
