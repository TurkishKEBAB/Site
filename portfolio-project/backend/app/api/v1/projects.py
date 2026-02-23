"""
Project Endpoints
CRUD operations for projects
"""
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectTranslationCreate,
    ProjectUpdate,
)
from app.crud import project as project_crud
from app.services.storage_service import StorageService

router = APIRouter()


def _serialize_project(project, language: str) -> dict:
    translated = next(
        (item for item in project.translations if item.language == language),
        None,
    )
    fallback = next(
        (item for item in project.translations if item.language == "en"),
        None,
    )
    source = translated or fallback

    title = source.title if source else project.title
    short_description = source.short_description if source else project.short_description
    description = source.description if source else project.description

    return {
        "id": str(project.id),
        "slug": project.slug,
        "title": title,
        "short_description": short_description,
        "description": description,
        "cover_image": project.cover_image,
        "github_url": project.github_url,
        "demo_url": project.demo_url,
        "featured": project.featured,
        "display_order": project.display_order,
        "created_at": project.created_at.isoformat() if project.created_at else None,
        "updated_at": project.updated_at.isoformat() if project.updated_at else None,
        "technologies": [
            {
                "id": str(tech.id),
                "name": tech.name,
                "slug": tech.slug,
                "icon": tech.icon,
                "color": tech.color,
                "category": tech.category,
            }
            for tech in project.technologies
        ],
        "translations": [
            {
                "id": str(trans.id),
                "language": trans.language,
                "title": trans.title,
                "short_description": trans.short_description,
                "description": trans.description,
            }
            for trans in project.translations
        ],
        "images": [
            {
                "id": str(img.id),
                "image_url": img.image_url,
                "caption": img.caption,
                "display_order": img.display_order,
            }
            for img in project.images
        ],
    }


@router.get("/")
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    language: str = Query("en", regex="^(tr|en)$"),
    featured_only: bool = False,
    technology_slug: str = None,
    db: Session = Depends(get_db)
):
    """
    Get list of projects with optional filtering
    """
    total = project_crud.get_projects_count(
        db,
        featured_only=featured_only,
        technology_slug=technology_slug,
    )

    projects = project_crud.get_projects(
        db,
        skip=skip,
        limit=limit,
        language=language,
        featured_only=featured_only,
        technology_slug=technology_slug
    )
    items = [_serialize_project(project, language) for project in projects]
    
    return {
        "items": items,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }


@router.get("/{slug}", response_model=ProjectResponse)
async def get_project(
    slug: str,
    language: str = Query("en", regex="^(tr|en)$"),
    db: Session = Depends(get_db)
):
    """
    Get a specific project by slug
    """
    project = project_crud.get_project_by_slug(db, slug=slug, language=language)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return _serialize_project(project, language)


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Create a new project (admin only)
    """
    return project_crud.create_project(db, project_data)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Update a project (admin only)
    """
    updated_project = project_crud.update_project(db, project_id=project_id, project_update=project_data)
    
    if not updated_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return updated_project


@router.post("/{project_id}/upload-image", status_code=status.HTTP_201_CREATED)
async def upload_project_image(
    project_id: uuid.UUID,
    file: UploadFile = File(...),
    caption: str = None,
    display_order: int = 0,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Upload an image for a project (admin only)
    """
    from app.models.project import ProjectImage
    
    # Verify project exists
    project = project_crud.get_project_by_id(db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Validate file
    storage_service = StorageService()
    is_valid, error_message = storage_service.validate_file(
        file.filename or "upload.jpg",
        file.size or 0,
        allowed_extensions=["jpg", "jpeg", "png", "gif", "webp"]
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Read file content
    file_content = await file.read()
    
    # Upload to storage
    file_path = f"projects/{project_id}/{file.filename}"
    public_url = await storage_service.upload_file(
        file_path=file_path,
        file_data=file_content,
        content_type=file.content_type or "image/jpeg",
        optimize=True
    )
    
    if not public_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image"
        )
    
    # Create ProjectImage record
    project_image = ProjectImage(
        project_id=project_id,
        image_url=public_url,
        caption=caption,
        display_order=display_order
    )
    db.add(project_image)
    db.commit()
    db.refresh(project_image)
    
    return {
        "id": str(project_image.id),
        "url": public_url,
        "caption": caption,
        "display_order": display_order,
        "filename": file.filename,
        "size": len(file_content)
    }


@router.delete("/{project_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project_image(
    project_id: uuid.UUID,
    image_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Delete a project image (admin only)
    """
    from app.models.project import ProjectImage
    
    # Verify project exists
    project = project_crud.get_project_by_id(db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Find and delete image
    image = db.query(ProjectImage).filter(
        ProjectImage.id == image_id,
        ProjectImage.project_id == project_id
    ).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    db.delete(image)
    db.commit()
    
    return None


@router.put("/{project_id}/images/{image_id}", response_model=dict)
async def update_project_image(
    project_id: uuid.UUID,
    image_id: uuid.UUID,
    caption: str = None,
    display_order: int = None,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Update project image caption and/or display order (admin only)
    """
    from app.models.project import ProjectImage
    
    # Verify project exists
    project = project_crud.get_project_by_id(db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Find image
    image = db.query(ProjectImage).filter(
        ProjectImage.id == image_id,
        ProjectImage.project_id == project_id
    ).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Update fields
    if caption is not None:
        image.caption = caption
    if display_order is not None:
        image.display_order = display_order
    
    db.commit()
    db.refresh(image)
    
    return {
        "id": str(image.id),
        "image_url": image.image_url,
        "caption": image.caption,
        "display_order": image.display_order
    }


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Delete a project (admin only)
    """
    success = project_crud.delete_project(db, project_id=project_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return None


@router.post("/{project_id}/translations", response_model=ProjectResponse)
async def add_project_translation(
    project_id: uuid.UUID,
    translation_data: ProjectTranslationCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """
    Add or update translation for a project (admin only)
    """
    updated_project = project_crud.add_project_translation(
        db,
        project_id=project_id,
        translation=translation_data
    )
    
    if not updated_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project = project_crud.get_project_by_id(db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return project
