"""
Blog CRUD Operations
Blog posts and translations management
"""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from typing import List, Optional
from datetime import datetime
import uuid
from slugify import slugify

from app.models.blog import BlogPost, BlogTranslation
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogTranslationCreate


def _apply_blog_translation(post: BlogPost, language: Optional[str] = None) -> BlogPost:
    """Apply requested translation to a blog post with English fallback."""
    if not language or language == "en":
        return post

    translations = post.translations or []
    translated = next((item for item in translations if item.language == language), None)
    fallback = next((item for item in translations if item.language == "en"), None)
    source = translated or fallback

    if source:
        post.title = source.title
        post.content = source.content
        post.excerpt = source.excerpt

    return post


def get_blog_posts(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    published_only: bool = True,
    language: Optional[str] = None
) -> List[BlogPost]:
    """
    Get list of blog posts
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        published_only: Only return published posts
        language: Filter by language (for translations)
        
    Returns:
        List of blog posts
    """
    query = db.query(BlogPost).options(joinedload(BlogPost.translations))
    
    if published_only:
        query = query.filter(BlogPost.published == True)
    
    query = query.order_by(BlogPost.published_at.desc())
    posts = query.offset(skip).limit(limit).all()

    return [_apply_blog_translation(post, language) for post in posts]


def get_blog_post_by_id(db: Session, post_id: uuid.UUID) -> Optional[BlogPost]:
    """Get blog post by ID with translations"""
    return db.query(BlogPost).options(
        joinedload(BlogPost.translations)
    ).filter(BlogPost.id == post_id).first()


def get_blog_post_by_slug(
    db: Session,
    slug: str,
    language: Optional[str] = None
) -> Optional[BlogPost]:
    """Get blog post by slug with translations"""
    post = db.query(BlogPost).options(
        joinedload(BlogPost.translations)
    ).filter(BlogPost.slug == slug).first()

    if not post:
        return None

    return _apply_blog_translation(post, language)


def create_blog_post(db: Session, post: BlogPostCreate, author_id: uuid.UUID) -> BlogPost:
    """
    Create a new blog post
    
    Args:
        db: Database session
        post: Blog post creation schema
        author_id: Author user ID
        
    Returns:
        Created blog post
    """
    # Generate slug if not provided
    slug = post.slug or slugify(post.title)
    
    # Ensure slug is unique
    base_slug = slug
    counter = 1
    while db.query(BlogPost).filter(BlogPost.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    # Calculate reading time if not provided (simple: ~200 words per minute)
    reading_time = post.reading_time
    if not reading_time and post.content:
        word_count = len(post.content.split())
        reading_time = max(1, word_count // 200)
    
    db_post = BlogPost(
        slug=slug,
        title=post.title,
        content=post.content,
        excerpt=post.excerpt,
        cover_image=str(post.cover_image) if post.cover_image else None,
        author_id=author_id,
        published=post.published,
        published_at=datetime.utcnow() if post.published else None,
        reading_time=reading_time
    )
    
    db.add(db_post)
    db.flush()  # Flush to get the ID
    
    # Add translations if provided
    if post.translations:
        for translation in post.translations:
            db_translation = BlogTranslation(
                blog_post_id=db_post.id,
                language=translation.language,
                title=translation.title,
                content=translation.content,
                excerpt=translation.excerpt
            )
            db.add(db_translation)
    
    db.commit()
    db.refresh(db_post)
    
    return db_post


def update_blog_post(
    db: Session,
    post_id: uuid.UUID,
    post_update: BlogPostUpdate
) -> Optional[BlogPost]:
    """
    Update a blog post
    
    Args:
        db: Database session
        post_id: Blog post ID
        post_update: Blog post update schema
        
    Returns:
        Updated blog post or None
    """
    db_post = get_blog_post_by_id(db, post_id)
    
    if not db_post:
        return None
    
    update_data = post_update.model_dump(exclude_unset=True)
    
    # Handle published status change
    if "published" in update_data:
        if update_data["published"] and not db_post.published:
            update_data["published_at"] = datetime.utcnow()
        elif not update_data["published"]:
            update_data["published_at"] = None
    
    # Convert HttpUrl to string if present
    if "cover_image" in update_data and update_data["cover_image"]:
        update_data["cover_image"] = str(update_data["cover_image"])
    
    for field, value in update_data.items():
        setattr(db_post, field, value)
    
    db.commit()
    db.refresh(db_post)
    
    return db_post


def delete_blog_post(db: Session, post_id: uuid.UUID) -> bool:
    """
    Delete a blog post
    
    Args:
        db: Database session
        post_id: Blog post ID
        
    Returns:
        True if deleted, False if not found
    """
    db_post = get_blog_post_by_id(db, post_id)
    
    if not db_post:
        return False
    
    db.delete(db_post)
    db.commit()
    
    return True


def increment_blog_views(db: Session, post_id: uuid.UUID) -> bool:
    """
    Increment blog post view count
    
    Args:
        db: Database session
        post_id: Blog post ID
        
    Returns:
        True if successful
    """
    db_post = get_blog_post_by_id(db, post_id)
    
    if not db_post:
        return False
    
    db_post.views += 1
    db.commit()
    
    return True


def search_blog_posts(
    db: Session,
    search_query: str,
    language: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    published_only: bool = True
) -> List[BlogPost]:
    """
    Search blog posts by title or content
    
    Args:
        db: Database session
        query: Search query
        skip: Number of records to skip
        limit: Maximum number of records to return
        published_only: Only return published posts
        
    Returns:
        List of matching blog posts
    """
    search = f"%{search_query}%"
    
    db_query = db.query(BlogPost).filter(
        or_(
            BlogPost.title.ilike(search),
            BlogPost.content.ilike(search),
            BlogPost.excerpt.ilike(search)
        )
    )
    
    if published_only:
        db_query = db_query.filter(BlogPost.published == True)

    posts = db_query.order_by(BlogPost.published_at.desc()).offset(skip).limit(limit).all()

    return [_apply_blog_translation(post, language) for post in posts]


def get_blog_count(db: Session, published_only: bool = True) -> int:
    """Get total count of blog posts"""
    query = db.query(func.count(BlogPost.id))
    
    if published_only:
        query = query.filter(BlogPost.published == True)
    
    return query.scalar()


def add_blog_translation(
    db: Session,
    post_id: uuid.UUID,
    translation: BlogTranslationCreate
) -> Optional[BlogTranslation]:
    """
    Add or update a blog post translation
    
    Args:
        db: Database session
        post_id: Blog post ID
        translation: Translation data
        
    Returns:
        Created/updated translation or None
    """
    # Check if blog post exists
    db_post = get_blog_post_by_id(db, post_id)
    if not db_post:
        return None
    
    # Check if translation already exists
    existing = db.query(BlogTranslation).filter(
        BlogTranslation.blog_post_id == post_id,
        BlogTranslation.language == translation.language
    ).first()
    
    if existing:
        # Update existing translation
        existing.title = translation.title
        existing.content = translation.content
        existing.excerpt = translation.excerpt
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new translation
        db_translation = BlogTranslation(
            blog_post_id=post_id,
            language=translation.language,
            title=translation.title,
            content=translation.content,
            excerpt=translation.excerpt
        )
        db.add(db_translation)
        db.commit()
        db.refresh(db_translation)
        return db_translation
