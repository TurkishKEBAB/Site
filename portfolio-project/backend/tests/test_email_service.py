"""Email service tests."""

import pytest

from app.services.email_service import EmailService


@pytest.mark.asyncio
async def test_send_email_skips_smtp_when_credentials_are_missing(monkeypatch):
    monkeypatch.setattr("app.services.email_service.settings.SMTP_USERNAME", None)
    monkeypatch.setattr("app.services.email_service.settings.SMTP_PASSWORD", None)

    calls = 0

    async def fail_if_called(*args, **kwargs):
        nonlocal calls
        calls += 1
        raise AssertionError("SMTP must not be called without credentials")

    monkeypatch.setattr("app.services.email_service.aiosmtplib.send", fail_if_called)

    result = await EmailService().send_email(
        to_email="recipient@example.com",
        subject="Subject",
        body="Body",
    )

    assert result is False
    assert calls == 0


@pytest.mark.asyncio
async def test_send_email_passes_an_explicit_smtp_timeout(monkeypatch):
    """Without a timeout, a host that blocks SMTP hangs the request ~122s."""
    captured = {}

    async def fake_send(message, **kwargs):
        captured.update(kwargs)

    monkeypatch.setattr("app.services.email_service.aiosmtplib.send", fake_send)
    monkeypatch.setattr("app.services.email_service.settings.EMAIL_ENABLED", True)
    monkeypatch.setattr("app.services.email_service.settings.SMTP_TIMEOUT_SECONDS", 5.0)

    sent = await EmailService().send_email("to@example.com", "subject", "body")

    assert sent is True
    assert captured["timeout"] == 5.0


@pytest.mark.asyncio
async def test_send_email_skips_delivery_when_disabled(monkeypatch):
    calls = []

    async def fake_send(message, **kwargs):
        calls.append(kwargs)

    monkeypatch.setattr("app.services.email_service.aiosmtplib.send", fake_send)
    monkeypatch.setattr("app.services.email_service.settings.EMAIL_ENABLED", False)

    sent = await EmailService().send_email("to@example.com", "subject", "body")

    assert sent is False
    assert calls == []
