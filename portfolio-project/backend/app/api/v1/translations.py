"""
Translations & Site Configuration Endpoints
Multi-language support and site settings
"""

from typing import Dict

from app.api.deps import get_db, require_admin
from app.crud import site as site_crud
from app.models.user import User
from app.services.admin_audit import record_admin_action
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()


# Request/Response models
class TranslationUpdate(BaseModel):
    translations: Dict[str, str]


class ConfigUpdate(BaseModel):
    key: str
    value: str
    description: str = None


# Translation endpoints
@router.get("/")
def get_all_translations(db: Session = Depends(get_db)):
    """
    Get all translations grouped by language
    Returns: {"tr": {...}, "en": {...}}
    """
    return site_crud.get_all_translations(db)


@router.get("/{language}")
def get_translations(
    language: str = Path(..., pattern="^(tr|en)$"), db: Session = Depends(get_db)
):
    """
    Get translations for a specific language
    """
    translations = site_crud.get_translations(db, language=language)

    if not translations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No translations found for language: {language}",
        )

    return translations


@router.get("/languages/available")
def get_available_languages(db: Session = Depends(get_db)):
    """
    Get list of available languages
    """
    languages = site_crud.get_available_languages(db)
    return {"languages": languages}


@router.put("/{language}", response_model=dict)
def update_translations(
    language: str = Path(..., pattern="^(tr|en)$"),
    data: TranslationUpdate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Bulk update translations for a language (admin only)
    """
    if not data or not data.translations:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No translations provided"
        )

    count = site_crud.bulk_set_translations(db, language, data.translations)

    record_admin_action(
        db,
        actor=current_user,
        action="translations.bulk_upsert",
        target_type="translation",
        target_id=language,
        details={"updated_count": count},
    )
    return {"success": True, "language": language, "updated_count": count}


@router.post("/{language}/{key}")
def set_translation(
    language: str = Path(..., pattern="^(tr|en)$"),
    key: str = Path(...),
    value: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Set or update a single translation (admin only)
    """
    translation = site_crud.set_translation(db, language, key, value)

    record_admin_action(
        db,
        actor=current_user,
        action="translation.upsert",
        target_type="translation",
        target_id=f"{language}.{key}",
    )
    return {
        "success": True,
        "translation": {
            "language": translation.language,
            "key": translation.translation_key,
            "value": translation.value,
        },
    }


@router.delete("/config/{key}", status_code=status.HTTP_204_NO_CONTENT)
def delete_config(
    key: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin)
):
    """
    Delete a configuration (admin only)
    """
    success = site_crud.delete_site_config(db, key)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Configuration not found"
        )

    record_admin_action(
        db,
        actor=current_user,
        action="site_config.delete",
        target_type="site_config",
        target_id=key,
    )
    return None


@router.delete("/{language}/{key}", status_code=status.HTTP_204_NO_CONTENT)
def delete_translation(
    language: str = Path(..., pattern="^(tr|en)$"),
    key: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Delete a translation (admin only)
    """
    success = site_crud.delete_translation(db, language, key)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Translation not found"
        )

    record_admin_action(
        db,
        actor=current_user,
        action="translation.delete",
        target_type="translation",
        target_id=f"{language}.{key}",
    )
    return None


# Site configuration endpoints
@router.get("/config/all")
def get_all_config(db: Session = Depends(get_db)):
    """
    Get all site configuration
    """
    return site_crud.get_all_site_config(db)


@router.get("/config/{key}")
def get_config(key: str, db: Session = Depends(get_db)):
    """
    Get a specific configuration value
    """
    config = site_crud.get_site_config(db, key)

    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration key not found: {key}",
        )

    return {"key": config.key, "value": config.value, "description": config.description}


@router.post("/config")
def set_config(
    data: ConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Set or update site configuration (admin only)
    """
    config = site_crud.set_site_config(db, data.key, data.value, data.description)

    record_admin_action(
        db,
        actor=current_user,
        action="site_config.upsert",
        target_type="site_config",
        target_id=data.key,
    )
    return {
        "success": True,
        "config": {
            "key": config.key,
            "value": config.value,
            "description": config.description,
        },
    }
