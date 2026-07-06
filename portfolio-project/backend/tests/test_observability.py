"""Observability service tests."""

from unittest.mock import Mock

from app.services import observability


def test_resolve_release_prefers_explicit_and_environment(monkeypatch):
    monkeypatch.setenv("SENTRY_RELEASE", "env-release")

    assert observability.resolve_release(" explicit-release ") == "explicit-release"
    assert observability.resolve_release() == "env-release"


def test_resolve_release_falls_back_to_unknown(monkeypatch):
    for env_name in (
        "SENTRY_RELEASE",
        "GITHUB_SHA",
        "RAILWAY_GIT_COMMIT_SHA",
        "VERCEL_GIT_COMMIT_SHA",
    ):
        monkeypatch.delenv(env_name, raising=False)
    monkeypatch.setattr(observability.settings, "VERSION", "")

    assert observability.resolve_release() == "unknown"


def test_init_observability_is_idempotent(monkeypatch):
    sentry_init = Mock()
    monkeypatch.setattr(observability, "_initialized", True)
    monkeypatch.setattr(observability.sentry_sdk, "init", sentry_init)

    observability.init_observability()

    sentry_init.assert_not_called()


def test_init_observability_skips_without_dsn(monkeypatch):
    sentry_init = Mock()
    monkeypatch.setattr(observability, "_initialized", False)
    monkeypatch.setattr(observability.settings, "SENTRY_DSN", None)
    monkeypatch.setattr(observability.sentry_sdk, "init", sentry_init)

    observability.init_observability()

    sentry_init.assert_not_called()
    assert observability._initialized is False


def test_init_observability_uses_single_resolved_release(monkeypatch):
    captured_options = {}
    resolve_calls = []

    def fake_resolve_release(explicit_release=None):
        resolve_calls.append(explicit_release)
        return "release-from-settings"

    def fake_init(**kwargs):
        captured_options.update(kwargs)

    monkeypatch.setattr(observability, "_initialized", False)
    monkeypatch.setattr(observability.settings, "SENTRY_DSN", "https://key@sentry.io/1")
    monkeypatch.setattr(observability.settings, "SENTRY_RELEASE", "explicit-release")
    monkeypatch.setattr(observability, "resolve_release", fake_resolve_release)
    monkeypatch.setattr(observability, "FastApiIntegration", lambda: "fastapi")
    monkeypatch.setattr(observability, "SqlalchemyIntegration", lambda: "sqlalchemy")
    monkeypatch.setattr(
        observability,
        "LoggingIntegration",
        lambda level=None, event_level=None: (level, event_level),
    )
    monkeypatch.setattr(observability.sentry_sdk, "init", fake_init)

    observability.init_observability()

    assert resolve_calls == ["explicit-release"]
    assert captured_options["release"] == "release-from-settings"
    assert captured_options["integrations"] == [
        "fastapi",
        "sqlalchemy",
        (None, None),
    ]
    assert observability._initialized is True


def test_capture_exception_only_reports_when_initialized(monkeypatch):
    captured = []
    exc = RuntimeError("boom")
    monkeypatch.setattr(
        observability.sentry_sdk,
        "capture_exception",
        lambda error: captured.append(error),
    )

    monkeypatch.setattr(observability, "_initialized", False)
    observability.capture_exception(exc)

    monkeypatch.setattr(observability, "_initialized", True)
    observability.capture_exception(exc)

    assert captured == [exc]
