"""
Shared schema primitives.
"""
import ipaddress
from typing import Annotated, Any, Optional

from pydantic import BeforeValidator


def _stringify_ip_address(value: Any) -> Any:
    """Normalise a PostgreSQL ``inet`` value into a plain string.

    ``ip_address`` columns use ``String(45).with_variant(INET, "postgresql")``,
    and psycopg3 loads ``inet`` through its ``InetLoader`` — so production hands
    back ``ipaddress`` objects while SQLite (used by the tests) hands back
    ``str``. Pydantic rejects the objects, which surfaced as HTTP 500 on every
    admin endpoint that serialises a stored IP.
    """
    if isinstance(value, (ipaddress.IPv4Interface, ipaddress.IPv6Interface)):
        return str(value.ip)
    if isinstance(value, (ipaddress.IPv4Address, ipaddress.IPv6Address)):
        return str(value)
    return value


IpAddressStr = Annotated[Optional[str], BeforeValidator(_stringify_ip_address)]
