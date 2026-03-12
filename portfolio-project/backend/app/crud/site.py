"""
Site Configuration, Translations, and Analytics CRUD Operations
"""
from sqlalchemy.orm import Session
from typing import List, Optional, Dict

from app.models.site import SiteConfig, Translation


# Site Configuration
def get_site_config(db: Session, key: str) -> Optional[SiteConfig]:
    """Get site configuration by key"""
    return db.query(SiteConfig).filter(SiteConfig.key == key).first()


def get_all_site_config(db: Session) -> Dict[str, str]:
    """Get all site configuration as dictionary"""
    configs = db.query(SiteConfig).all()
    return {config.key: config.value for config in configs}


def set_site_config(db: Session, key: str, value: str, description: Optional[str] = None) -> SiteConfig:
    """Set or update site configuration"""
    existing = get_site_config(db, key)
    
    if existing:
        existing.value = value
        if description:
            existing.description = description
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db_config = SiteConfig(key=key, value=value, description=description)
        db.add(db_config)
        db.commit()
        db.refresh(db_config)
        return db_config


def delete_site_config(db: Session, key: str) -> bool:
    """Delete site configuration"""
    config = get_site_config(db, key)
    
    if not config:
        return False
    
    db.delete(config)
    db.commit()
    return True


# Translations
def get_translations(db: Session, language: str) -> Dict[str, str]:
    """
    Get all translations for a language
    
    Args:
        db: Database session
        language: Language code (tr, en, de, fr)
        
    Returns:
        Dictionary of translation key-value pairs
    """
    translations = db.query(Translation).filter(Translation.language == language).all()
    return {t.translation_key: t.value for t in translations}


def get_all_translations(db: Session) -> Dict[str, Dict[str, str]]:
    """
    Get all translations grouped by language
    
    Returns:
        Dictionary with languages as keys and translation dictionaries as values
    """
    translations = db.query(Translation).all()
    
    grouped = {}
    for t in translations:
        if t.language not in grouped:
            grouped[t.language] = {}
        grouped[t.language][t.translation_key] = t.value
    
    return grouped


def set_translation(
    db: Session,
    language: str,
    translation_key: str,
    value: str
) -> Translation:
    """Set or update a translation"""
    existing = db.query(Translation).filter(
        Translation.language == language,
        Translation.translation_key == translation_key
    ).first()
    
    if existing:
        existing.value = value
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db_translation = Translation(
            language=language,
            translation_key=translation_key,
            value=value
        )
        db.add(db_translation)
        db.commit()
        db.refresh(db_translation)
        return db_translation


def bulk_set_translations(db: Session, language: str, translations: Dict[str, str]) -> int:
    """
    Set multiple translations at once

    Returns:
        Number of translations set
    """
    count = 0
    for key, value in translations.items():
        existing = db.query(Translation).filter(
            Translation.language == language,
            Translation.translation_key == key,
        ).first()
        if existing:
            existing.value = value
        else:
            db.add(Translation(language=language, translation_key=key, value=value))
        count += 1
    db.commit()
    return count


def delete_translation(db: Session, language: str, translation_key: str) -> bool:
    """Delete a translation"""
    translation = db.query(Translation).filter(
        Translation.language == language,
        Translation.translation_key == translation_key
    ).first()
    
    if not translation:
        return False
    
    db.delete(translation)
    db.commit()
    return True


def get_available_languages(db: Session) -> List[str]:
    """Get list of available languages"""
    return [lang[0] for lang in db.query(Translation.language).distinct().all()]
