"""
Cache Service
Redis-backed caching with a process-local in-memory fallback.
Used for GitHub API responses, translations, and rate limiting.
"""
import redis.asyncio as redis
import json
import time
from typing import Any, Dict, Optional, Tuple

from loguru import logger

from app.config import settings

# Module-level clock indirection so tests can control expiry without sleeping
_now = time.monotonic


class CacheService:
    """Service for caching.

    Prefers Redis; when the connection fails (e.g. no Redis service in the
    deployment) it degrades to a process-local TTL cache instead of disabling
    caching. With a single replica the memory backend is functionally
    equivalent for caching — entries simply reset on restart/deploy.
    """

    def __init__(self, memory_max_entries: int = 512):
        self.redis_client: Optional[redis.Redis] = None
        # key -> (expires_at based on _now(), JSON-serialized value);
        # expires_at None means no expiry (mirrors Redis TTL -1)
        self._memory: Dict[str, Tuple[Optional[float], str]] = {}
        self._memory_max_entries = memory_max_entries

    @property
    def backend(self) -> str:
        """Active cache backend: "redis" or "memory"."""
        return "redis" if self.redis_client else "memory"

    async def connect(self):
        """Connect to Redis; fall back to the in-memory backend on failure"""
        try:
            self.redis_client = await redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None
            )

            # Test connection
            await self.redis_client.ping()
            logger.info("Successfully connected to Redis")

        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            logger.warning("Cache service will use the in-process memory backend")
            self.redis_client = None

    async def disconnect(self):
        """Disconnect from Redis and drop any in-memory entries"""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Disconnected from Redis")
        self._memory.clear()

    def _memory_lookup(self, key: str) -> Optional[str]:
        """Return the serialized value for a live key, evicting it if expired"""
        entry = self._memory.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if expires_at is not None and expires_at <= _now():
            del self._memory[key]
            return None
        return value

    def _memory_store(self, key: str, value: str, ttl: Optional[int]) -> None:
        """Store a serialized value, evicting expired/oldest entries at capacity"""
        if key not in self._memory and len(self._memory) >= self._memory_max_entries:
            now = _now()
            for stale in [
                k for k, (exp, _) in self._memory.items()
                if exp is not None and exp <= now
            ]:
                del self._memory[stale]
            while len(self._memory) >= self._memory_max_entries:
                # dicts preserve insertion order: drop the oldest entry
                del self._memory[next(iter(self._memory))]
        expires_at = _now() + ttl if ttl is not None else None
        self._memory[key] = (expires_at, value)

    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Cached value or None
        """
        if not self.redis_client:
            value = self._memory_lookup(key)
            return json.loads(value) if value is not None else None

        try:
            value = await self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None

        except Exception as e:
            logger.error(f"Error getting cache key {key}: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: int = 3600):
        """
        Set value in cache

        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time to live in seconds (default: 1 hour)
        """
        serialized_value = json.dumps(value, default=str)

        if not self.redis_client:
            self._memory_store(key, serialized_value, ttl)
            return

        try:
            await self.redis_client.setex(key, ttl, serialized_value)
            logger.debug(f"Cached key {key} with TTL {ttl}s")

        except Exception as e:
            logger.error(f"Error setting cache key {key}: {e}")

    async def delete(self, key: str):
        """
        Delete value from cache

        Args:
            key: Cache key
        """
        if not self.redis_client:
            self._memory.pop(key, None)
            return

        try:
            await self.redis_client.delete(key)
            logger.debug(f"Deleted cache key {key}")

        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {e}")

    async def exists(self, key: str) -> bool:
        """
        Check if key exists in cache

        Args:
            key: Cache key

        Returns:
            True if key exists
        """
        if not self.redis_client:
            return self._memory_lookup(key) is not None

        try:
            return await self.redis_client.exists(key) > 0

        except Exception as e:
            logger.error(f"Error checking cache key {key}: {e}")
            return False

    async def ttl(self, key: str) -> int:
        """
        Get remaining time to live for a key

        Args:
            key: Cache key

        Returns:
            Remaining TTL in seconds, -1 if key exists but no TTL, -2 if key doesn't exist
        """
        if not self.redis_client:
            if self._memory_lookup(key) is None:
                return -2
            expires_at, _ = self._memory[key]
            if expires_at is None:
                return -1
            return max(1, int(expires_at - _now()))

        try:
            return await self.redis_client.ttl(key)

        except Exception as e:
            logger.error(f"Error getting TTL for key {key}: {e}")
            return -2

    async def increment(self, key: str, amount: int = 1) -> int:
        """
        Increment a counter in cache

        Args:
            key: Cache key
            amount: Amount to increment

        Returns:
            New value after increment
        """
        if not self.redis_client:
            current = self._memory_lookup(key)
            new_value = (int(json.loads(current)) if current is not None else 0) + amount
            entry = self._memory.get(key)
            if entry is not None:
                # keep the existing expiry, matching Redis INCRBY
                self._memory[key] = (entry[0], json.dumps(new_value))
            else:
                self._memory_store(key, json.dumps(new_value), None)
            return new_value

        try:
            return await self.redis_client.incrby(key, amount)

        except Exception as e:
            logger.error(f"Error incrementing cache key {key}: {e}")
            return 0

    async def set_with_expiry(self, key: str, ttl: int):
        """
        Set expiry on an existing key

        Args:
            key: Cache key
            ttl: Time to live in seconds
        """
        if not self.redis_client:
            if self._memory_lookup(key) is not None:
                _, value = self._memory[key]
                self._memory[key] = (_now() + ttl, value)
            return

        try:
            await self.redis_client.expire(key, ttl)

        except Exception as e:
            logger.error(f"Error setting expiry for key {key}: {e}")


# Singleton instance
_cache_service: Optional[CacheService] = None


def get_cache_service() -> CacheService:
    """Get or create cache service instance"""
    global _cache_service
    if _cache_service is None:
        _cache_service = CacheService()
    return _cache_service
