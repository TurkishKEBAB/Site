"""
CAPTCHA verification service for public endpoints.
"""
from typing import Optional

import httpx
from loguru import logger

from app.config import settings


async def verify_captcha_token(
    captcha_token: Optional[str],
    remote_ip: Optional[str] = None,
) -> bool:
    """
    Validate CAPTCHA token against configured provider.
    """
    if not settings.CAPTCHA_ENABLED:
        return True

    if not captcha_token:
        return False

    if not settings.CAPTCHA_SECRET_KEY:
        logger.error("CAPTCHA_ENABLED is true but CAPTCHA_SECRET_KEY is not configured")
        return False

    payload = {
        "secret": settings.CAPTCHA_SECRET_KEY,
        "response": captcha_token,
    }
    if remote_ip:
        payload["remoteip"] = remote_ip

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(settings.captcha_verify_url, data=payload)
        if response.status_code != 200:
            logger.warning("CAPTCHA verification failed with status {}", response.status_code)
            return False

        body = response.json()
        return bool(body.get("success"))
    except Exception as exc:
        logger.error("CAPTCHA verification request failed: {}", exc)
        return False
