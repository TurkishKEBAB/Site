"""
Translations & Site Configuration Endpoints
Multi-language support and site settings
"""
from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_db, require_admin
from app.crud import site as site_crud

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
async def get_all_translations(
    db: Session = Depends(get_db)
):
    """
    Get all translations grouped by language
    Returns: {"tr": {...}, "en": {...}}
    """
    return site_crud.get_all_translations(db)


@router.get("/{language}")
async def get_translations(
    language: str = Path(..., regex="^(tr|en)$"),
    db: Session = Depends(get_db)
):
    """
    Get translations for a specific language
    """
    translations = site_crud.get_translations(db, language=language)
    
    if not translations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No translations found for language: {language}"
        )
    
    return translations


@router.get("/languages/available")
async def get_available_languages(
    db: Session = Depends(get_db)
):
    """
    Get list of available languages
    """
    languages = site_crud.get_available_languages(db)
    return {"languages": languages}


@router.put("/{language}", response_model=dict)
async def update_translations(
    language: str = Path(..., regex="^(tr|en)$"),
    data: TranslationUpdate = None,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Bulk update translations for a language (admin only)
    """
    if not data or not data.translations:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No translations provided"
        )
    
    count = site_crud.bulk_set_translations(db, language, data.translations)
    
    return {
        "success": True,
        "language": language,
        "updated_count": count
    }


@router.post("/{language}/{key}")
async def set_translation(
    language: str = Path(..., regex="^(tr|en)$"),
    key: str = Path(...),
    value: str = Query(...),
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Set or update a single translation (admin only)
    """
    translation = site_crud.set_translation(db, language, key, value)
    
    return {
        "success": True,
        "translation": {
            "language": translation.language,
            "key": translation.translation_key,
            "value": translation.value
        }
    }


@router.delete("/{language}/{key}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_translation(
    language: str = Path(..., regex="^(tr|en)$"),
    key: str = Path(...),
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Delete a translation (admin only)
    """
    success = site_crud.delete_translation(db, language, key)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation not found"
        )
    
    return None


# Site configuration endpoints
@router.get("/config/all")
async def get_all_config(
    db: Session = Depends(get_db)
):
    """
    Get all site configuration
    """
    return site_crud.get_all_site_config(db)


@router.get("/config/{key}")
async def get_config(
    key: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific configuration value
    """
    config = site_crud.get_site_config(db, key)
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration key not found: {key}"
        )
    
    return {
        "key": config.key,
        "value": config.value,
        "description": config.description
    }


@router.post("/config")
async def set_config(
    data: ConfigUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Set or update site configuration (admin only)
    """
    config = site_crud.set_site_config(db, data.key, data.value, data.description)
    
    return {
        "success": True,
        "config": {
            "key": config.key,
            "value": config.value,
            "description": config.description
        }
    }


@router.delete("/config/{key}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_config(
    key: str,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Delete a configuration (admin only)
    """
    success = site_crud.delete_site_config(db, key)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuration not found"
        )
    
    return None
