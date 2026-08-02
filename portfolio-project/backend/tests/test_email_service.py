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
