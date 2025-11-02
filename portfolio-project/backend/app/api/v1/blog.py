"""
Blog Post Endpoints
CRUD operations for blog posts
"""
from typing import List
import math
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import uuid

from app.api.deps import get_db, require_admin, get_current_user_optional
from app.schemas.blog import (
    BlogPostCreate,
    BlogPostUpdate,
    BlogPostResponse,
    BlogPostListResponse,
    BlogTranslationCreate
)
from app.crud import blog as blog_crud

router = APIRouter()


@router.get("/", response_model=BlogPostListResponse)
async def get_blog_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    language: str = Query("en", regex="^(tr|en|de|fr)$"),
    published_only: bool = True,
    db: Session = Depends(get_db)
):
    """
    Get list of blog posts with pagination
    """
    posts = blog_crud.get_blog_posts(
        db,
        skip=skip,
        limit=limit,
        language=language,
        published_only=published_only
    )
    
    total = blog_crud.get_blog_count(db, published_only=published_only)
    pages = math.ceil(total / limit) if limit else 1
    page = skip // limit + 1 if limit else 1
    
    return {
        "items": posts,
        "total": total,
        "page": page,
        "size": limit,
        "pages": max(pages, 1)
    }


@router.get("/search", response_model=List[BlogPostResponse])
async def search_blog_posts(
    q: str = Query(..., min_length=2),
    language: str = Query("en", regex="^(tr|en|de|fr)$"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Search blog posts by title and content
    """
    return blog_crud.search_blog_posts(db, search_query=q, language=language, limit=limit)


@router.get("/{slug}", response_model=BlogPostResponse)
async def get_blog_post(
    slug: str,
    language: str = Query("en", regex="^(tr|en|de|fr)$"),
    db: Session = Depends(get_db)
):
    """
    Get a specific blog post by slug
    Also increments view count
    """
    post = blog_crud.get_blog_post_by_slug(db, slug=slug, language=language)
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )
    
    # Increment view count
    blog_crud.increment_blog_views(db, post.id)
    
    return post


@router.post("/", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
async def create_blog_post(
    post_data: BlogPostCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Create a new blog post (admin only)
    """
    return blog_crud.create_blog_post(db, post_data, author_id=current_user.id)


@router.put("/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: uuid.UUID,
    post_data: BlogPostUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Update a blog post (admin only)
    """
    updated_post = blog_crud.update_blog_post(db, post_id=post_id, post_data=post_data)
    
    if not updated_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )
    
    return updated_post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog_post(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Delete a blog post (admin only)
    """
    success = blog_crud.delete_blog_post(db, post_id=post_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )
    
    return None


@router.post("/{post_id}/translations", response_model=BlogPostResponse)
async def add_blog_translation(
    post_id: uuid.UUID,
    translation_data: BlogTranslationCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Add or update translation for a blog post (admin only)
    """
    updated_post = blog_crud.add_blog_translation(db, post_id=post_id, translation_data=translation_data)
    
    if not updated_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )
    
    return updated_post
