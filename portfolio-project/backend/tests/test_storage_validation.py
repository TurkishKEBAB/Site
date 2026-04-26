"""Unit tests for StorageService content validation."""

import io

from app.services.storage_service import StorageService
from PIL import Image


def _png_bytes() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (2, 2), color=(255, 255, 255)).save(buffer, format="PNG")
    return buffer.getvalue()


def _jpeg_bytes() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (2, 2), color=(255, 0, 0)).save(buffer, format="JPEG")
    return buffer.getvalue()


def test_validate_file_content_accepts_real_png():
    service = StorageService()
    is_valid, message = service.validate_file_content(_png_bytes())
    assert is_valid is True
    assert message == ""


def test_validate_file_content_accepts_real_jpeg():
    service = StorageService()
    is_valid, message = service.validate_file_content(_jpeg_bytes())
    assert is_valid is True


def test_validate_file_content_rejects_text_payload():
    service = StorageService()
    is_valid, message = service.validate_file_content(b"<html>nope</html>")
    assert is_valid is False
    assert "allowed type" in message.lower()


def test_validate_file_content_rejects_empty_payload():
    service = StorageService()
    is_valid, message = service.validate_file_content(b"")
    assert is_valid is False
    assert "empty" in message.lower()


def test_validate_file_content_respects_custom_allow_list():
    service = StorageService()
    # PNG is valid generally, but disallowed when only JPEG is in the allow list
    is_valid, message = service.validate_file_content(
        _png_bytes(), allowed_mimes={"image/jpeg"}
    )
    assert is_valid is False
    assert "image/jpeg" in message
