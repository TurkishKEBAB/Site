"""Contact endpoint tests."""

import pytest


def enable_smtp(monkeypatch):
    """Give the endpoint a configured mailbox so delivery gets scheduled."""
    monkeypatch.setattr("app.api.v1.contact.settings.EMAIL_ENABLED", True)
    monkeypatch.setattr("app.api.v1.contact.settings.SMTP_USERNAME", "site@example.com")
    monkeypatch.setattr("app.api.v1.contact.settings.SMTP_PASSWORD", "app-password")


def test_submit_contact_message_does_not_wait_for_smtp(client, monkeypatch):
    """SMTP must never sit inside the request/response cycle.

    Production spent ~11s on two timing-out SMTP sends while the browser client
    aborts at 10s, so a message that was already stored came back to the visitor
    as "the contact API is unavailable".
    """
    from fastapi import BackgroundTasks

    sent_during_request = []
    scheduled = []

    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            sent_during_request.append("confirmation")
            return True

        async def send_admin_notification(self, **kwargs):
            sent_during_request.append("admin_notification")
            return True

    def record_task(self, func, *args, **kwargs):
        scheduled.append((func, kwargs))

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)
    monkeypatch.setattr(BackgroundTasks, "add_task", record_task)
    enable_smtp(monkeypatch)

    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Async Sender",
            "email": "async@example.com",
            "subject": "Delivery timing",
            "message": "The response must not block on the mail server.",
        },
    )

    assert response.status_code == 201
    assert response.json()["email_queued"] is True
    assert sent_during_request == []
    assert [task.__name__ for task, _ in scheduled] == ["deliver_contact_emails"]
    assert scheduled[0][1]["email"] == "async@example.com"


def test_submit_contact_message_success(client, monkeypatch):
    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            return True

        async def send_admin_notification(self, **kwargs):
            return True

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)
    enable_smtp(monkeypatch)

    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "subject": "Test Subject",
            "message": "This is a test message",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == (
        "Your message has been received and is visible in the admin panel."
    )
    assert payload["email_queued"] is True


def test_submit_contact_message_email_failure_is_non_blocking(client, monkeypatch):
    notification_calls = []

    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            raise RuntimeError("smtp down")

        async def send_admin_notification(self, **kwargs):
            notification_calls.append(kwargs)
            return True

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)
    enable_smtp(monkeypatch)

    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "subject": "Test Subject",
            "message": "This is a test message",
        },
    )

    assert response.status_code == 201
    assert response.json()["success"] is True
    # A failed confirmation must not stop the admin notification behind it.
    assert notification_calls[0]["user_email"] == "jane@example.com"


def test_submit_contact_message_admin_notification_failure_is_non_blocking(
    client, monkeypatch
):
    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            return True

        async def send_admin_notification(self, **kwargs):
            raise RuntimeError("smtp admin notification down")

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)
    enable_smtp(monkeypatch)

    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Admin Notification Failure",
            "email": "admin-failure@example.com",
            "subject": "Admin notification",
            "message": "The submission should still be stored safely.",
        },
    )

    assert response.status_code == 201
    assert response.json()["success"] is True


def test_submit_contact_message_handles_email_service_constructor_failure(
    client, monkeypatch
):
    class FailingEmailService:
        def __init__(self):
            raise RuntimeError("email service unavailable")

    monkeypatch.setattr("app.api.v1.contact.EmailService", FailingEmailService)
    enable_smtp(monkeypatch)

    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Email Service Failure",
            "email": "service-failure@example.com",
            "subject": "Service failure",
            "message": "The submission should remain visible in the inbox.",
        },
    )

    assert response.status_code == 201
    assert response.json()["success"] is True


def test_submit_contact_message_allows_blank_subject_and_stores_message(
    client, admin_headers, monkeypatch
):
    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            return False

        async def send_admin_notification(self, **kwargs):
            return False

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)
    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Blank Subject",
            "email": "blank@example.com",
            "subject": "",
            "message": "This message must appear in the admin inbox.",
        },
    )

    assert response.status_code == 201

    messages = client.get("/api/v1/contact/", headers=admin_headers)
    assert messages.status_code == 200
    assert messages.json()["total"] == 1
    assert messages.json()["messages"][0]["email"] == "blank@example.com"
    assert messages.json()["messages"][0]["message"] == (
        "This message must appear in the admin inbox."
    )


@pytest.mark.parametrize(
    "email_enabled, username, password",
    [
        (False, "site@example.com", "app-password"),
        (True, "", "app-password"),
        (True, "site@example.com", ""),
    ],
)
def test_submit_contact_message_skips_delivery_when_mail_is_unconfigured(
    client, monkeypatch, email_enabled, username, password
):
    """No mailbox configured means nothing to queue, and the caller is told so."""
    sends = []

    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            sends.append("confirmation")
            return True

        async def send_admin_notification(self, **kwargs):
            sends.append("admin_notification")
            return True

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)
    monkeypatch.setattr("app.api.v1.contact.settings.EMAIL_ENABLED", email_enabled)
    monkeypatch.setattr("app.api.v1.contact.settings.SMTP_USERNAME", username)
    monkeypatch.setattr("app.api.v1.contact.settings.SMTP_PASSWORD", password)

    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Unconfigured Mail",
            "email": "unconfigured@example.com",
            "subject": "Delivery",
            "message": "The message is stored even with no mailbox configured.",
        },
    )

    assert response.status_code == 201
    assert response.json()["email_queued"] is False
    assert sends == []


def test_submit_contact_message_validation(client):
    response = client.post(
        "/api/v1/contact/",
        json={"name": "", "email": "invalid-email", "message": ""},
    )
    assert response.status_code == 422


def test_submit_contact_message_rate_limited(client, monkeypatch):
    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            return True

        async def send_admin_notification(self, **kwargs):
            return True

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)

    payload = {
        "name": "Rate Test",
        "email": "rate@example.com",
        "subject": "Rate",
        "message": "Message body long enough",
    }

    for _ in range(5):
        ok = client.post("/api/v1/contact/", json=payload)
        assert ok.status_code == 201

    blocked = client.post("/api/v1/contact/", json=payload)
    assert blocked.status_code == 429


def test_submit_contact_requires_captcha_when_enabled(client, monkeypatch):
    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            return True

        async def send_admin_notification(self, **kwargs):
            return True

    async def fake_verify_captcha_token(*args, **kwargs):
        return False

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)
    monkeypatch.setattr("app.api.v1.contact.settings.CAPTCHA_ENABLED", True)
    monkeypatch.setattr("app.api.v1.contact.verify_captcha_token", fake_verify_captcha_token)

    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Captcha User",
            "email": "captcha@example.com",
            "subject": "Captcha",
            "message": "This is a captcha protected message",
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Captcha verification failed"


def test_submit_contact_accepts_unverified_captcha_when_fail_open(client, monkeypatch):
    """A dead/rotated site key must not lock the contact form shut.

    With CAPTCHA_FAIL_OPEN the submission still reaches the admin inbox; the
    rate limiter remains the abuse control.
    """

    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            return True

        async def send_admin_notification(self, **kwargs):
            return True

    async def fake_verify_captcha_token(*args, **kwargs):
        return False

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)
    monkeypatch.setattr("app.api.v1.contact.settings.CAPTCHA_ENABLED", True)
    monkeypatch.setattr("app.api.v1.contact.settings.CAPTCHA_FAIL_OPEN", True)
    monkeypatch.setattr(
        "app.api.v1.contact.verify_captcha_token", fake_verify_captcha_token
    )

    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Fail Open User",
            "email": "failopen@example.com",
            "subject": "Fail open",
            "message": "This message must survive a broken captcha widget",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["success"] is True
    assert payload["message_id"]


def test_submit_contact_fail_open_defaults_to_disabled():
    from app.config import Settings

    assert Settings.model_fields["CAPTCHA_FAIL_OPEN"].default is False


def test_get_messages_requires_admin(client, user_headers):
    unauth = client.get("/api/v1/contact/")
    forbidden = client.get("/api/v1/contact/", headers=user_headers)

    assert unauth.status_code == 401
    assert forbidden.status_code == 403


def test_get_messages_filters_and_unread_count(client, admin_headers, create_contact_message):
    create_contact_message(name="User 1", is_read=False)
    create_contact_message(name="User 2", is_read=True)

    all_messages = client.get("/api/v1/contact/", headers=admin_headers)
    unread = client.get("/api/v1/contact/?unread_only=true", headers=admin_headers)
    unread_count = client.get("/api/v1/contact/unread-count", headers=admin_headers)

    assert all_messages.status_code == 200
    assert all_messages.json()["total"] == 2
    assert unread.status_code == 200
    assert unread.json()["total"] == 1
    assert unread_count.status_code == 200
    assert unread_count.json()["unread_count"] == 1


def test_get_single_mark_read_mark_replied_and_delete(client, admin_headers, create_contact_message):
    message = create_contact_message(is_read=False, is_replied=False)

    get_single = client.get(f"/api/v1/contact/{message.id}", headers=admin_headers)
    mark_read = client.patch(f"/api/v1/contact/{message.id}/read", headers=admin_headers)
    mark_replied = client.patch(f"/api/v1/contact/{message.id}/replied", headers=admin_headers)
    delete = client.delete(f"/api/v1/contact/{message.id}", headers=admin_headers)
    get_deleted = client.get(f"/api/v1/contact/{message.id}", headers=admin_headers)

    assert get_single.status_code == 200
    assert mark_read.status_code == 200
    assert mark_read.json()["is_read"] is True
    assert mark_replied.status_code == 200
    assert mark_replied.json()["is_replied"] is True
    assert delete.status_code == 204
    assert get_deleted.status_code == 404


def test_contact_item_not_found_paths(client, admin_headers, invalid_uuid):
    get_missing = client.get(f"/api/v1/contact/{invalid_uuid}", headers=admin_headers)
    read_missing = client.patch(f"/api/v1/contact/{invalid_uuid}/read", headers=admin_headers)
    replied_missing = client.patch(f"/api/v1/contact/{invalid_uuid}/replied", headers=admin_headers)
    delete_missing = client.delete(f"/api/v1/contact/{invalid_uuid}", headers=admin_headers)

    assert get_missing.status_code == 404
    assert read_missing.status_code == 404
    assert replied_missing.status_code == 404
    assert delete_missing.status_code == 404


def test_contact_message_schema_accepts_postgres_inet_objects():
    """psycopg3 loads `inet` columns as ipaddress objects, not str.

    Production served HTTP 500 on every admin inbox read because Pydantic
    rejected them; SQLite-backed tests never saw it since the variant only
    activates on PostgreSQL.
    """
    import ipaddress
    import uuid as uuid_mod
    from datetime import datetime, timezone

    from app.schemas.contact import ContactMessage

    for raw in (
        ipaddress.IPv4Address("81.213.5.9"),
        ipaddress.IPv4Interface("81.213.5.9/32"),
        ipaddress.IPv6Address("2001:db8::1"),
        "81.213.5.9",
        None,
    ):
        parsed = ContactMessage.model_validate(
            {
                "id": uuid_mod.uuid4(),
                "name": "Probe",
                "email": "probe@example.com",
                "subject": "s",
                "message": "a message long enough to pass validation",
                "ip_address": raw,
                "user_agent": None,
                "created_at": datetime.now(timezone.utc),
            }
        )
        assert parsed.ip_address is None or isinstance(parsed.ip_address, str)

    assert (
        ContactMessage.model_validate(
            {
                "id": uuid_mod.uuid4(),
                "name": "Probe",
                "email": "probe@example.com",
                "subject": "s",
                "message": "a message long enough to pass validation",
                "ip_address": ipaddress.IPv4Interface("81.213.5.9/32"),
                "user_agent": None,
                "created_at": datetime.now(timezone.utc),
            }
        ).ip_address
        == "81.213.5.9"
    )


def test_admin_message_list_survives_inet_ip_addresses(
    client, admin_headers, create_contact_message, monkeypatch
):
    import ipaddress

    from app.api.v1 import contact as contact_router

    stored = create_contact_message(name="Inet User")
    original = contact_router.contact_crud.get_contact_messages

    def _with_inet_ip(db, **kwargs):
        rows = original(db, **kwargs)
        for row in rows:
            row.ip_address = ipaddress.IPv4Address("81.213.5.9")
        return rows

    monkeypatch.setattr(contact_router.contact_crud, "get_contact_messages", _with_inet_ip)

    response = client.get("/api/v1/contact/", headers=admin_headers)

    assert response.status_code == 200
    assert response.json()["messages"][0]["ip_address"] == "81.213.5.9"
    assert stored is not None


def test_server_errors_still_carry_cors_headers(client, admin_headers, monkeypatch):
    """A 500 without CORS headers reaches the browser as net::ERR_FAILED."""
    from app.api.v1 import contact as contact_router
    from app.config import settings as app_settings

    def _boom(*args, **kwargs):
        raise RuntimeError("simulated failure")

    monkeypatch.setattr(contact_router.contact_crud, "get_contact_messages", _boom)
    origin = app_settings.ALLOWED_ORIGINS[0]

    # The default TestClient re-raises server exceptions instead of returning
    # the response the browser would actually receive.
    from starlette.testclient import TestClient

    with TestClient(client.app, raise_server_exceptions=False) as raw_client:
        response = raw_client.get(
            "/api/v1/contact/",
            headers={**admin_headers, "Origin": origin},
        )

    assert response.status_code == 500
    assert response.headers["access-control-allow-origin"] == origin


@pytest.mark.parametrize(
    "origin, expect_header",
    [
        (None, False),          # non-browser client: nothing to echo
        ("https://evil.example", False),  # origin outside ALLOWED_ORIGINS
    ],
)
def test_server_error_cors_headers_are_scoped_to_allowed_origins(
    client, admin_headers, monkeypatch, origin, expect_header
):
    from starlette.testclient import TestClient

    from app.api.v1 import contact as contact_router

    def _boom(*args, **kwargs):
        raise RuntimeError("simulated failure")

    monkeypatch.setattr(contact_router.contact_crud, "get_contact_messages", _boom)

    headers = dict(admin_headers)
    if origin is not None:
        headers["Origin"] = origin

    with TestClient(client.app, raise_server_exceptions=False) as raw_client:
        response = raw_client.get("/api/v1/contact/", headers=headers)

    assert response.status_code == 500
    assert ("access-control-allow-origin" in response.headers) is expect_header
