"""Optional Sentry initialization and helpers."""

from __future__ import annotations

import os
from typing import Optional

import sentry_sdk
from loguru import logger
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from app.config import settings

_initialized = False


def resolve_release(explicit_release: Optional[str] = None) -> str:
    """Resolve release from an explicit value, deploy metadata, or app version."""

    candidates = [
        explicit_release,
        os.getenv("SENTRY_RELEASE"),
        os.getenv("GITHUB_SHA"),
        os.getenv("RAILWAY_GIT_COMMIT_SHA"),
        os.getenv("VERCEL_GIT_COMMIT_SHA"),
        settings.VERSION,
    ]
    for candidate in candidates:
        if candidate and candidate.strip():
            return candidate.strip()
    return "unknown"


def init_observability() -> None:
    """Initialize Sentry when a DSN is configured."""

    global _initialized
    if _initialized:
        return

    if not settings.SENTRY_DSN:
        logger.info("Sentry backend reporting disabled: SENTRY_DSN is not set.")
        return

    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.SENTRY_ENVIRONMENT or settings.ENVIRONMENT,
        release=resolve_release(settings.SENTRY_RELEASE),
        traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
        profiles_sample_rate=settings.SENTRY_PROFILES_SAMPLE_RATE,
        integrations=[
            FastApiIntegration(),
            SqlalchemyIntegration(),
            LoggingIntegration(level=None, event_level=None),
        ],
        send_default_pii=False,
    )
    _initialized = True
    logger.info("Sentry backend reporting enabled for release {}", resolve_release())


def capture_exception(exc: BaseException) -> None:
    """Capture an exception only when Sentry has been initialized."""

    if _initialized:
        sentry_sdk.capture_exception(exc)
