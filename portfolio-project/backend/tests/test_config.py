"""Configuration validation tests."""

from app.config import Settings


def _build_settings(**overrides) -> Settings:
    base = {
        "DATABASE_URL": "sqlite:///./test.db",
        "SECRET_KEY": "x" * 40,
        "SMTP_USERNAME": "ci@example.com",
        "SMTP_PASSWORD": "ci-password",
        "FRONTEND_URL": "https://example.com",
        "ENVIRONMENT": "development",
    }
    base.update(overrides)
    return Settings(**base)


def test_production_requires_captcha_enabled_and_secret():
    settings = _build_settings(
        ENVIRONMENT="production",
        CAPTCHA_ENABLED=False,
        CAPTCHA_SECRET_KEY=None,
    )

    errors = settings.production_validation_errors()

    assert "CAPTCHA_ENABLED must be true in production." in errors
    assert "CAPTCHA_SECRET_KEY must be set in production." in errors


def test_production_with_valid_security_settings_has_no_errors():
    settings = _build_settings(
        ENVIRONMENT="production",
        CAPTCHA_ENABLED=True,
        CAPTCHA_SECRET_KEY="turnstile-secret",
        SECRET_KEY="y" * 40,
        FRONTEND_URL="https://portfolio.example.com",
    )

    assert settings.production_validation_errors() == []


def test_production_rejects_known_insecure_secret_key():
    settings = _build_settings(
        ENVIRONMENT="production",
        CAPTCHA_ENABLED=True,
        CAPTCHA_SECRET_KEY="turnstile-secret",
        SECRET_KEY="dev-secret-key-change-in-production",
        FRONTEND_URL="https://portfolio.example.com",
    )

    errors = settings.production_validation_errors()

    assert "SECRET_KEY contains a known insecure default value." in errors
