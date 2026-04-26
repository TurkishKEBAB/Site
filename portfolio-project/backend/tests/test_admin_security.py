"""Admin authorization security regression tests."""

import pytest
from app.api import deps
from fastapi import HTTPException


class DummyUser:
    def __init__(self, email: str):
        self.email = email


class RecordingLogger:
    def __init__(self):
        self.messages: list[str] = []

    def debug(self, message, *args, **_kwargs):
        self.messages.append(str(message).format(*args))

    def info(self, message, *args, **_kwargs):
        self.messages.append(str(message).format(*args))

    def warning(self, message, *args, **_kwargs):
        self.messages.append(str(message).format(*args))


def test_require_admin_logs_no_email_or_admin_list(monkeypatch):
    logger = RecordingLogger()
    monkeypatch.setattr(deps, "logger", logger)
    monkeypatch.setattr(deps.settings, "ADMIN_EMAILS", "admin@test.com")

    with pytest.raises(HTTPException) as exc_info:
        deps.require_admin(DummyUser("user@test.com"))

    assert exc_info.value.status_code == 403
    joined_messages = "\n".join(logger.messages)
    assert "user@test.com" not in joined_messages
    assert "admin@test.com" not in joined_messages


def test_require_admin_fails_closed_when_admin_emails_empty(monkeypatch):
    monkeypatch.setattr(deps.settings, "ADMIN_EMAILS", "")
    expected_detail = "Server misconfiguration: ADMIN_EMAILS not set"

    with pytest.raises(HTTPException) as exc_info:
        deps.require_admin(DummyUser("admin@test.com"))

    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == expected_detail
