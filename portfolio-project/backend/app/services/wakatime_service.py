"""
WakaTime API Integration Service
Fetches coding-activity stats with Redis caching (1h by default) for the
home-page Command Center. Uses the account Secret API Key (Basic auth).
"""

import base64
from typing import Any, Dict, List, Optional

import httpx
from loguru import logger

from app.config import settings
from app.services.cache_service import get_cache_service

WAKATIME_BASE_URL = "https://wakatime.com/api/v1"
CACHE_KEY = "wakatime_stats_v2"
TOP_LANGUAGES = 5


class WakaTimeService:
    """Service for WakaTime API integration."""

    def __init__(self):
        self.api_key = settings.WAKATIME_API_KEY
        self.base_url = WAKATIME_BASE_URL
        self.cache = get_cache_service()
        self.cache_key = CACHE_KEY
        self.cache_ttl = settings.WAKATIME_CACHE_HOURS * 3600

    def get_headers(self) -> Dict[str, str]:
        """Basic auth header with the base64-encoded Secret API Key."""
        encoded = base64.b64encode(f"{self.api_key}:".encode("utf-8")).decode("ascii")
        return {"Authorization": f"Basic {encoded}"}

    @staticmethod
    def _summarize_languages(languages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Keep the top N languages by percent, fold the rest into 'Other'."""
        ranked = sorted(
            (
                {
                    "name": lang.get("name", "Unknown"),
                    "percent": float(lang.get("percent", 0.0)),
                }
                for lang in languages
            ),
            key=lambda item: item["percent"],
            reverse=True,
        )
        top = ranked[:TOP_LANGUAGES]
        rest = ranked[TOP_LANGUAGES:]
        if rest:
            other_percent = round(sum(item["percent"] for item in rest), 1)
            if other_percent > 0:
                top.append({"name": "Other", "percent": other_percent})
        return [
            {"name": item["name"], "percent": round(item["percent"], 1)} for item in top
        ]

    @staticmethod
    def _stats_are_pending(status_code: int, payload: Dict[str, Any]) -> bool:
        """Return True when WakaTime says stats are still being processed."""
        data = payload.get("data") if isinstance(payload, dict) else None
        return status_code == 202 or (
            isinstance(data, dict) and data.get("is_up_to_date") is False
        )

    @staticmethod
    def _summarize_breakdown(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalize live WakaTime project/editor breakdowns for the UI."""
        ranked = sorted(
            (
                {
                    "name": item.get("name", "Unknown"),
                    "percent": round(float(item.get("percent") or 0.0), 1),
                    "seconds": int(item.get("total_seconds") or 0),
                    "text": item.get("text")
                    or item.get("human_readable_total")
                    or "",
                }
                for item in items
            ),
            key=lambda item: item["percent"],
            reverse=True,
        )
        return ranked

    @staticmethod
    def _find_most_active_day(days: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Return the highest-activity day from the live WakaTime response."""
        if not days:
            return None

        active_day = max(days, key=lambda item: int(item.get("total_seconds") or 0))
        return {
            "date": active_day.get("date", ""),
            "seconds": int(active_day.get("total_seconds") or 0),
            "text": active_day.get("text")
            or active_day.get("human_readable_total")
            or "",
        }

    async def fetch_stats(
        self, force_refresh: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch normalized WakaTime stats.

        Combines `all_time_since_today` (total) with `stats/last_7_days`
        (weekly total, daily average, language breakdown). Returns cached
        data when fresh; falls back to stale cache (then None) on error.
        Returns None when no API key is configured.
        """
        if not self.api_key:
            logger.warning("WAKATIME_API_KEY is not set; skipping WakaTime fetch")
            return None

        if not force_refresh:
            cached = await self.cache.get(self.cache_key)
            if cached:
                logger.info("Returning cached WakaTime stats")
                return cached

        logger.info("Fetching WakaTime stats from API")
        try:
            headers = self.get_headers()
            async with httpx.AsyncClient(timeout=30.0) as client:
                all_time_resp = await client.get(
                    f"{self.base_url}/users/current/all_time_since_today",
                    headers=headers,
                )
                all_time_resp.raise_for_status()
                seven_resp = await client.get(
                    f"{self.base_url}/users/current/stats/last_7_days",
                    headers=headers,
                )
                seven_resp.raise_for_status()

            all_time = all_time_resp.json().get("data", {})
            seven_payload = seven_resp.json()
            if self._stats_are_pending(seven_resp.status_code, seven_payload):
                logger.warning(
                    "WakaTime stats are still processing; keeping cached stats"
                )
                stale = await self.cache.get(self.cache_key)
                if stale:
                    return stale
                return None

            seven = seven_payload.get("data", {})

            stats = {
                "all_time_seconds": int(all_time.get("total_seconds") or 0),
                "all_time_text": all_time.get("text") or "",
                "last_7_days_seconds": int(seven.get("total_seconds") or 0),
                "last_7_days_text": seven.get("human_readable_total") or "",
                "daily_average_seconds": int(seven.get("daily_average") or 0),
                "daily_average_text": seven.get("human_readable_daily_average") or "",
                "languages": self._summarize_languages(seven.get("languages") or []),
                "projects": self._summarize_breakdown(seven.get("projects") or []),
                "editors": self._summarize_breakdown(seven.get("editors") or []),
                "most_active_day": self._find_most_active_day(seven.get("days") or []),
                "range": "last_7_days",
            }

            await self.cache.set(self.cache_key, stats, ttl=self.cache_ttl)
            logger.info("Fetched and cached WakaTime stats")
            return stats

        except httpx.HTTPError as e:
            logger.error(f"WakaTime API error: {e}")
        except Exception as e:  # noqa: BLE001 - normalize any upstream failure
            logger.error(f"Unexpected error fetching WakaTime stats: {e}")

        # On failure, serve stale cache if we have it.
        stale = await self.cache.get(self.cache_key)
        if stale:
            logger.warning("Serving stale WakaTime stats after fetch failure")
        return stale

    async def clear_cache(self) -> None:
        """Clear cached WakaTime stats."""
        await self.cache.delete(self.cache_key)
        logger.info("WakaTime stats cache cleared")
