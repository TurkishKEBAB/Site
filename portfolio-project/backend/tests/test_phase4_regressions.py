"""Phase 4 regression tests — edge cases identified in the remediation plan.

Covers:
- 4.2 §1.1  Blog view double-increment regression (language=en path)
- 4.2 §1.2  DummyStorage without max_upload_size attribute
- 4.2 §4.2  ContactMessage max_length enforcement
- 4.2 §1.6  require_admin with empty ADMIN_EMAILS
- 4.2 §1.9  JWT token missing jti claim
- 4.2 §2.11 search_blog_posts returns correct filtered results
"""
from datetime import datetime, timedelta, timezone

from jose import jwt

from app.config import settings


# ---------------------------------------------------------------------------
# 1.1 Blog view double-increment regression
# ---------------------------------------------------------------------------


def test_blog_view_exact_increment_language_en(client, create_blog_post):
    """GET /blog/{slug}?language=en must increment views by exactly +1 (regression §1.1)."""
    create_blog_post(slug="en-view-test", views=0, published=True)

    response = client.get("/api/v1/blog/en-view-test?language=en")

    assert response.status_code == 200
    assert response.json()["views"] == 1


def test_blog_view_exact_increment_language_tr(client, create_blog_post):
    """GET /blog/{slug}?language=tr must also increment views by exactly +1."""
    create_blog_post(slug="tr-view-test", views=0, published=True)

    response = client.get("/api/v1/blog/tr-view-test?language=tr")

    assert response.status_code == 200
    assert response.json()["views"] == 1


# ---------------------------------------------------------------------------
# 1.2 DummyStorage without max_upload_size attribute
# ---------------------------------------------------------------------------


def test_upload_project_image_stub_without_max_size(
    client, admin_headers, create_project, monkeypatch
):
    """StorageService stub missing max_upload_size must not raise AttributeError (§1.2)."""

    class _DummyStorage:
        """Intentionally omits max_upload_size — mirrors the original test failure."""

        def validate_file(self, filename, file_size, allowed_extensions):
            return True, ""

        def validate_file_content(self, image_data):
            return True, ""

        async def upload_file(self, file_path, file_data, content_type, optimize):
            return "https://example.com/img.jpg"

    monkeypatch.setattr("app.api.v1.projects.StorageService", _DummyStorage)

    project = create_project(slug="stub-storage-project")
    response = client.post(
        f"/api/v1/projects/{project.id}/upload-image",
        headers=admin_headers,
        files={"file": ("photo.jpg", b"fake-image-bytes", "image/jpeg")},
    )

    assert response.status_code == 201


# ---------------------------------------------------------------------------
# 4.2 Contact message max_length
# ---------------------------------------------------------------------------


def test_contact_message_exceeds_5000_chars_returns_422(client):
    """message field over 5000 characters must be rejected with 422 (§4.2)."""
    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Long Message Sender",
            "email": "long@example.com",
            "subject": "Too Long",
            "message": "x" * 5001,
        },
    )

    assert response.status_code == 422


def test_contact_message_exactly_5000_chars_accepted(client, monkeypatch):
    """message field of exactly 5000 characters must be accepted (boundary check)."""

    class _DummyEmail:
        async def send_contact_form_confirmation(self, **kwargs):
            return True

        async def send_admin_notification(self, **kwargs):
            return True

    monkeypatch.setattr("app.api.v1.contact.EmailService", _DummyEmail)

    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Boundary Test",
            "email": "boundary@example.com",
            "subject": "Subject",
            "message": "y" * 5000,
        },
    )

    assert response.status_code == 201


# ---------------------------------------------------------------------------
# 1.6 require_admin — empty ADMIN_EMAILS
# ---------------------------------------------------------------------------


def test_require_admin_empty_email_list_returns_500(client, admin_headers, monkeypatch):
    """When ADMIN_EMAILS is empty, any admin endpoint must respond 500 (§1.6)."""
    monkeypatch.setattr(settings, "ADMIN_EMAILS", "")

    response = client.get("/api/v1/admin/stats", headers=admin_headers)

    assert response.status_code == 500


# ---------------------------------------------------------------------------
# 1.9 JWT token missing jti claim
# ---------------------------------------------------------------------------


def test_jwt_without_jti_claim_returns_401(client, admin_user):
    """Access token without a jti claim must be rejected with 401 (§1.9)."""
    payload = {
        "sub": str(admin_user.id),
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
    }
    # Deliberately omit jti by building the payload manually
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# 2.11 search_blog_posts result quality
# ---------------------------------------------------------------------------


def test_search_blog_posts_returns_only_matching_results(client, create_blog_post):
    """search endpoint must return only posts matching the query (§2.11)."""
    create_blog_post(
        slug="fastapi-guide",
        title="FastAPI Tutorial",
        content="fastapi sqlalchemy tutorial",
        published=True,
    )
    create_blog_post(
        slug="unrelated-topic",
        title="Unrelated Topic",
        content="nothing matches here",
        published=True,
    )

    response = client.get("/api/v1/blog/search?q=fastapi")

    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, list)
    assert len(results) == 1
    assert results[0]["slug"] == "fastapi-guide"
