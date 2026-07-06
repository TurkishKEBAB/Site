"""Shared API error response schemas."""

from typing import Any, Dict, Literal, Optional

from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """Machine-readable error details returned by every error handler."""

    code: str = Field(..., examples=["NOT_FOUND"])
    message: str = Field(..., examples=["Resource not found"])
    fields: Optional[Dict[str, str]] = Field(
        default=None,
        description="Field-level validation errors when safe to expose.",
    )
    details: Optional[Any] = Field(
        default=None,
        description="Non-production diagnostic details.",
    )
    request_id: Optional[str] = Field(
        default=None,
        description="Request id echoed in the X-Request-ID response header.",
    )


class ErrorResponse(BaseModel):
    """Standard error envelope for HTTP, validation, and unhandled errors."""

    success: Literal[False] = False
    error: ErrorDetail
    detail: Optional[Any] = Field(
        default=None,
        description="Legacy FastAPI-compatible detail field kept during migration.",
    )
