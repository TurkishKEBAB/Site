"""Shared API error contract and exception handlers."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Mapping, Optional

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from loguru import logger
from slowapi.errors import RateLimitExceeded
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.services.observability import capture_exception


@dataclass(slots=True)
class ApiError(Exception):
    """Application error carrying the public API error contract."""

    code: str
    message: str
    status_code: int = status.HTTP_400_BAD_REQUEST
    fields: Optional[Dict[str, str]] = None
    details: Optional[Any] = None


STATUS_ERROR_CODES: Mapping[int, str] = {
    status.HTTP_400_BAD_REQUEST: "BAD_REQUEST",
    status.HTTP_401_UNAUTHORIZED: "UNAUTHORIZED",
    status.HTTP_403_FORBIDDEN: "FORBIDDEN",
    status.HTTP_404_NOT_FOUND: "NOT_FOUND",
    status.HTTP_409_CONFLICT: "CONFLICT",
    422: "VALIDATION_ERROR",
    status.HTTP_429_TOO_MANY_REQUESTS: "RATE_LIMITED",
    status.HTTP_500_INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
}


def _request_id(request: Request) -> Optional[str]:
    value = getattr(request.state, "request_id", None)
    return str(value) if value else None


def _message_from_detail(detail: Any, fallback: str) -> str:
    if isinstance(detail, str) and detail.strip():
        return detail
    if isinstance(detail, dict):
        message = detail.get("message") or detail.get("error") or detail.get("detail")
        if isinstance(message, str) and message.strip():
            return message
    return fallback


def _validation_fields(exc: RequestValidationError) -> Dict[str, str]:
    fields: Dict[str, str] = {}
    for error in exc.errors():
        loc = [
            str(part)
            for part in error.get("loc", ())
            if part not in {"body", "query", "path", "header", "cookie"}
        ]
        key = ".".join(loc) or "request"
        fields[key] = str(error.get("msg", "Invalid value"))
    return fields


def build_error_payload(
    *,
    code: str,
    message: str,
    request_id: Optional[str] = None,
    fields: Optional[Dict[str, str]] = None,
    details: Optional[Any] = None,
    legacy_detail: Optional[Any] = None,
) -> Dict[str, Any]:
    """Build the stable error response while preserving legacy detail access."""

    error: Dict[str, Any] = {"code": code, "message": message}
    if fields:
        error["fields"] = fields
    if details is not None and not settings.is_production:
        error["details"] = details
    if request_id:
        error["request_id"] = request_id

    return {
        "success": False,
        "error": error,
        "detail": legacy_detail if legacy_detail is not None else message,
    }


async def api_error_handler(request: Request, exc: ApiError) -> JSONResponse:
    logger.warning("{} on {}: {}", exc.code, request.url.path, exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content=build_error_payload(
            code=exc.code,
            message=exc.message,
            request_id=_request_id(request),
            fields=exc.fields,
            details=exc.details,
            legacy_detail=exc.message,
        ),
    )


async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    code = STATUS_ERROR_CODES.get(exc.status_code, "HTTP_ERROR")
    message = _message_from_detail(exc.detail, code.replace("_", " ").title())
    return JSONResponse(
        status_code=exc.status_code,
        headers=exc.headers,
        content=build_error_payload(
            code=code,
            message=message,
            request_id=_request_id(request),
            legacy_detail=exc.detail,
        ),
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    logger.warning("Validation error on {}: {}", request.url.path, exc.errors())
    fields = None if settings.is_production else _validation_fields(exc)
    details = None if settings.is_production else exc.errors()
    return JSONResponse(
        status_code=422,
        content=build_error_payload(
            code="VALIDATION_ERROR",
            message="Validation Error",
            request_id=_request_id(request),
            fields=fields,
            details=details,
            legacy_detail="Validation Error",
        ),
    )


async def rate_limit_exception_handler(
    request: Request, exc: RateLimitExceeded
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content=build_error_payload(
            code="RATE_LIMITED",
            message="Rate limit exceeded",
            request_id=_request_id(request),
            legacy_detail=str(exc.detail or "Rate limit exceeded"),
        ),
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.opt(exception=True).error("Unhandled exception on {}: {}", request.url.path, exc)
    capture_exception(exc)

    public_message = "Internal server error"
    diagnostic_message = str(exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=build_error_payload(
            code="INTERNAL_SERVER_ERROR",
            message=public_message,
            request_id=_request_id(request),
            details={
                "message": diagnostic_message,
                "type": type(exc).__name__,
            },
            legacy_detail=public_message,
        ),
    )
