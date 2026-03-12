"""Rate limiting primitives shared across the API."""

from starlette.requests import Request
from slowapi import Limiter

from app.config import get_settings

settings = get_settings()


def _get_real_client_ip(request: Request) -> str:
    """Return the real client IP, respecting X-Forwarded-For behind a reverse proxy.

    Takes only the *first* address in the chain (the original client) to prevent
    spoofing via appended entries.  Falls back to ``request.client.host``
    when the header is absent (direct connections / development).
    """
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # "client, proxy1, proxy2" — take the leftmost (original client).
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


limiter = Limiter(
    key_func=_get_real_client_ip,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"],
)
