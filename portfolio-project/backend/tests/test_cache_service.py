"""In-memory fallback behaviour of CacheService when Redis is unavailable."""
import asyncio

from app.services import cache_service as cache_module
from app.services.cache_service import CacheService


def make_memory_cache(**kwargs) -> CacheService:
    # No connect() call: redis_client stays None, so the memory backend is used
    return CacheService(**kwargs)


def test_backend_reports_memory_without_redis():
    cache = make_memory_cache()
    assert cache.backend == "memory"


def test_backend_reports_redis_when_client_present():
    cache = make_memory_cache()
    cache.redis_client = object()
    assert cache.backend == "redis"


def test_memory_set_get_roundtrip():
    cache = make_memory_cache()
    asyncio.run(cache.set("key", {"a": 1, "b": ["x"]}, ttl=60))
    assert asyncio.run(cache.get("key")) == {"a": 1, "b": ["x"]}
    assert asyncio.run(cache.exists("key")) is True


def test_memory_get_missing_key_returns_none():
    cache = make_memory_cache()
    assert asyncio.run(cache.get("missing")) is None
    assert asyncio.run(cache.exists("missing")) is False
    assert asyncio.run(cache.ttl("missing")) == -2


def test_memory_entry_expires(monkeypatch):
    cache = make_memory_cache()
    now = 1000.0
    monkeypatch.setattr(cache_module, "_now", lambda: now)
    asyncio.run(cache.set("key", "value", ttl=10))

    monkeypatch.setattr(cache_module, "_now", lambda: now + 11)
    assert asyncio.run(cache.get("key")) is None
    assert asyncio.run(cache.exists("key")) is False
    assert asyncio.run(cache.ttl("key")) == -2


def test_memory_ttl_reports_remaining(monkeypatch):
    cache = make_memory_cache()
    monkeypatch.setattr(cache_module, "_now", lambda: 1000.0)
    asyncio.run(cache.set("key", "value", ttl=60))
    remaining = asyncio.run(cache.ttl("key"))
    assert 0 < remaining <= 60


def test_memory_delete_removes_key():
    cache = make_memory_cache()
    asyncio.run(cache.set("key", "value", ttl=60))
    asyncio.run(cache.delete("key"))
    assert asyncio.run(cache.get("key")) is None


def test_memory_increment_counts_and_respects_expiry(monkeypatch):
    cache = make_memory_cache()
    now = 1000.0
    monkeypatch.setattr(cache_module, "_now", lambda: now)

    assert asyncio.run(cache.increment("counter")) == 1
    assert asyncio.run(cache.increment("counter", 5)) == 6

    asyncio.run(cache.set_with_expiry("counter", 10))
    monkeypatch.setattr(cache_module, "_now", lambda: now + 11)
    assert asyncio.run(cache.get("counter")) is None
    # Expired counter restarts from zero, matching Redis INCRBY semantics
    assert asyncio.run(cache.increment("counter")) == 1


def test_memory_eviction_caps_entry_count():
    cache = make_memory_cache(memory_max_entries=2)
    asyncio.run(cache.set("first", 1, ttl=60))
    asyncio.run(cache.set("second", 2, ttl=60))
    asyncio.run(cache.set("third", 3, ttl=60))

    # Oldest entry is dropped, newer ones survive
    assert asyncio.run(cache.get("first")) is None
    assert asyncio.run(cache.get("second")) == 2
    assert asyncio.run(cache.get("third")) == 3


def test_disconnect_clears_memory_store():
    cache = make_memory_cache()
    asyncio.run(cache.set("key", "value", ttl=60))
    asyncio.run(cache.disconnect())
    assert asyncio.run(cache.get("key")) is None
