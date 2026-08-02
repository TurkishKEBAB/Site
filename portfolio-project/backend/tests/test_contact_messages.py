"""Contact endpoint tests."""

import pytest


def test_submit_contact_message_success(client, monkeypatch):
    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            return True

        async def send_admin_notification(self, **kwargs):
            return True

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)

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
    assert payload["email_sent"] is True


def test_submit_contact_message_email_failure_is_non_blocking(client, monkeypatch):
    notification_calls = []

    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            raise RuntimeError("smtp down")

        async def send_admin_notification(self, **kwargs):
            notification_calls.append(kwargs)
            return True

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)

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
    assert response.json()["email_sent"] is False
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
    assert response.json()["email_sent"] is False


def test_submit_contact_message_handles_email_service_constructor_failure(
    client, monkeypatch
):
    class FailingEmailService:
        def __init__(self):
            raise RuntimeError("email service unavailable")

    monkeypatch.setattr("app.api.v1.contact.EmailService", FailingEmailService)

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
    assert response.json()["email_sent"] is False


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
    assert response.json()["email_sent"] is False

    messages = client.get("/api/v1/contact/", headers=admin_headers)
    assert messages.status_code == 200
    assert messages.json()["total"] == 1
    assert messages.json()["messages"][0]["email"] == "blank@example.com"
    assert messages.json()["messages"][0]["message"] == (
        "This message must appear in the admin inbox."
    )


def test_submit_contact_message_reports_smtp_success(client, monkeypatch):
    class DummyEmailService:
        async def send_contact_form_confirmation(self, **kwargs):
            return True

        async def send_admin_notification(self, **kwargs):
            return True

    monkeypatch.setattr("app.api.v1.contact.EmailService", DummyEmailService)

    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Delivered User",
            "email": "delivered@example.com",
            "subject": "Delivery",
            "message": "Both notification messages should report success.",
        },
    )

    assert response.status_code == 201
    assert response.json()["email_sent"] is True


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
