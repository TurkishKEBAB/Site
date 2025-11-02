"""
Site Configuration, Translations, and Analytics CRUD Operations
"""
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timedelta

from app.models.site import SiteConfig, Translation, PageView


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
        set_translation(db, language, key, value)
        count += 1
    
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


# Page Views (Analytics)
def create_page_view(
    db: Session,
    page_path: str,
    referrer: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> PageView:
    """Record a page view"""
    db_view = PageView(
        page_path=page_path,
        referrer=referrer,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    db.add(db_view)
    db.commit()
    db.refresh(db_view)
    
    return db_view


def get_page_views_count(
    db: Session,
    page_path: Optional[str] = None,
    hours: Optional[int] = None
) -> int:
    """
    Get count of page views
    
    Args:
        db: Database session
        page_path: Filter by specific page path
        hours: Only count views within last N hours
        
    Returns:
        Number of page views
    """
    from sqlalchemy import func
    
    query = db.query(func.count(PageView.id))
    
    if page_path:
        query = query.filter(PageView.page_path == page_path)
    
    if hours:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        query = query.filter(PageView.viewed_at >= cutoff_time)
    
    return query.scalar()


def get_popular_pages(db: Session, limit: int = 10) -> List[tuple]:
    """
    Get most popular pages
    
    Returns:
        List of tuples (page_path, view_count)
    """
    from sqlalchemy import func
    
    return db.query(
        PageView.page_path,
        func.count(PageView.id).label('count')
    ).group_by(PageView.page_path).order_by(
        func.count(PageView.id).desc()
    ).limit(limit).all()
