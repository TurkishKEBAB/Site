"""
Blog Post Endpoints
CRUD operations for blog posts
"""

import math
import uuid
from typing import List

from app.api.deps import get_db, require_admin
from app.crud import blog as blog_crud
from app.models.user import User
from app.schemas.blog import (
    BlogPostCreate,
    BlogPostListResponse,
    BlogPostResponse,
    BlogPostUpdate,
    BlogTranslationCreate,
)
from app.services.admin_audit import record_admin_action
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=BlogPostListResponse)
async def get_blog_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    language: str = Query("en", pattern="^(tr|en)$"),
    published_only: bool = True,
    db: Session = Depends(get_db),
):
    """
    Get list of blog posts with pagination
    """
    total = blog_crud.get_blog_count(db, published_only=published_only)
    pages = math.ceil(total / limit) if limit else 1
    page = skip // limit + 1 if limit else 1

    posts = blog_crud.get_blog_posts(
        db, skip=skip, limit=limit, language=language, published_only=published_only
    )

    return {
        "items": posts,
        "total": total,
        "page": page,
        "size": limit,
        "pages": max(pages, 1),
    }


@router.get("/search", response_model=List[BlogPostResponse])
async def search_blog_posts(
    q: str = Query(..., min_length=2),
    language: str = Query("en", pattern="^(tr|en)$"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """
    Search blog posts by title and content
    """
    return blog_crud.search_blog_posts(
        db, search_query=q, language=language, limit=limit
    )


@router.get("/{slug}", response_model=BlogPostResponse)
async def get_blog_post(
    slug: str,
    language: str = Query("en", pattern="^(tr|en)$"),
    db: Session = Depends(get_db),
):
    """
    Get a specific blog post by slug
    Also increments view count
    """
    post = blog_crud.get_blog_post_by_slug(db, slug=slug, language=language)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found"
        )

    # Increment view count
    blog_crud.increment_blog_views(db, post.id)

    refreshed = blog_crud.get_blog_post_by_slug(db, slug=slug, language=language)
    if not refreshed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found",
        )

    return refreshed


@router.post("/", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
async def create_blog_post(
    post_data: BlogPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Create a new blog post (admin only)
    """
    post = blog_crud.create_blog_post(db, post_data, author_id=current_user.id)
    record_admin_action(
        db,
        actor=current_user,
        action="blog_post.create",
        target_type="blog_post",
        target_id=post.id,
        details={"slug": post.slug},
    )
    return post


@router.put("/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: uuid.UUID,
    post_data: BlogPostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Update a blog post (admin only)
    """
    updated_post = blog_crud.update_blog_post(
        db, post_id=post_id, post_update=post_data
    )

    if not updated_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found"
        )

    record_admin_action(
        db,
        actor=current_user,
        action="blog_post.update",
        target_type="blog_post",
        target_id=post_id,
        details={"slug": updated_post.slug},
    )
    return updated_post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog_post(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Delete a blog post (admin only)
    """
    success = blog_crud.delete_blog_post(db, post_id=post_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found"
        )

    record_admin_action(
        db,
        actor=current_user,
        action="blog_post.delete",
        target_type="blog_post",
        target_id=post_id,
    )
    return None


@router.post("/{post_id}/translations", response_model=BlogPostResponse)
async def add_blog_translation(
    post_id: uuid.UUID,
    translation_data: BlogTranslationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Add or update translation for a blog post (admin only)
    """
    updated_post = blog_crud.add_blog_translation(
        db, post_id=post_id, translation=translation_data
    )

    if not updated_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found"
        )

    post = blog_crud.get_blog_post_by_id(db, post_id=post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found",
        )

    record_admin_action(
        db,
        actor=current_user,
        action="blog_translation.upsert",
        target_type="blog_post",
        target_id=post_id,
        details={"language": translation_data.language},
    )
    return post
