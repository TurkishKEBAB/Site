"""
Redis Cache Service
Manages caching for GitHub API, translations, and rate limiting
"""
import redis.asyncio as redis
import json
from typing import Optional, Any
from loguru import logger

from app.config import settings


class CacheService:
    """Service for Redis caching"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
    
    async def connect(self):
        """Connect to Redis"""
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
            logger.warning("Cache service will operate in fallback mode (no caching)")
            self.redis_client = None
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Disconnected from Redis")
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None
        """
        if not self.redis_client:
            return None
        
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
        if not self.redis_client:
            return
        
        try:
            serialized_value = json.dumps(value, default=str)
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
            return False
        
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
            return -2
        
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
            return 0
        
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
