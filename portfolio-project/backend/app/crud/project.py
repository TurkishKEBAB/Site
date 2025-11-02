"""
Project CRUD Operations
Projects, technologies, and images management
"""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
import uuid
from slugify import slugify

from app.models.project import Project, ProjectTranslation, ProjectTechnology, ProjectImage
from app.models.technology import Technology
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectTranslationCreate


def get_projects(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    featured_only: bool = False,
    technology_slug: Optional[str] = None,
    language: Optional[str] = "en"
) -> List[Project]:
    """
    Get list of projects
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        featured_only: Only return featured projects
        technology_slug: Filter by technology slug
        language: Language code for translations (currently not used in filtering)
        
    Returns:
        List of projects
    """
    query = db.query(Project).options(
        joinedload(Project.translations),
        joinedload(Project.project_technologies).joinedload(ProjectTechnology.technology),
        joinedload(Project.images)
    )
    
    if featured_only:
        query = query.filter(Project.featured == True)
    
    if technology_slug:
        query = query.join(ProjectTechnology).join(Technology).filter(
            Technology.slug == technology_slug
        )
    
    query = query.order_by(Project.display_order, Project.created_at.desc())
    
    return query.offset(skip).limit(limit).all()


def get_project_by_id(db: Session, project_id: uuid.UUID) -> Optional[Project]:
    """Get project by ID with all relations"""
    return db.query(Project).options(
        joinedload(Project.translations),
        joinedload(Project.project_technologies).joinedload(ProjectTechnology.technology),
        joinedload(Project.images)
    ).filter(Project.id == project_id).first()


def get_project_by_slug(db: Session, slug: str, language: Optional[str] = "en") -> Optional[Project]:
    """Get project by slug with all relations"""
    return db.query(Project).options(
        joinedload(Project.translations),
        joinedload(Project.project_technologies).joinedload(ProjectTechnology.technology),
        joinedload(Project.images)
    ).filter(Project.slug == slug).first()


def create_project(db: Session, project: ProjectCreate) -> Project:
    """
    Create a new project
    
    Args:
        db: Database session
        project: Project creation schema
        
    Returns:
        Created project
    """
    # Generate slug if not provided
    slug = project.slug or slugify(project.title)
    
    # Ensure slug is unique
    base_slug = slug
    counter = 1
    while db.query(Project).filter(Project.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    db_project = Project(
        slug=slug,
        title=project.title,
        short_description=project.short_description,
        description=project.description,
        cover_image=str(project.cover_image) if project.cover_image else None,
        github_url=str(project.github_url) if project.github_url else None,
        demo_url=str(project.demo_url) if project.demo_url else None,
        featured=project.featured,
        display_order=project.display_order
    )
    
    db.add(db_project)
    db.flush()
    
    # Add technologies
    if project.technology_ids:
        for tech_id in project.technology_ids:
            db_project_tech = ProjectTechnology(
                project_id=db_project.id,
                technology_id=tech_id
            )
            db.add(db_project_tech)
    
    # Add translations
    if project.translations:
        for translation in project.translations:
            db_translation = ProjectTranslation(
                project_id=db_project.id,
                language=translation.language,
                title=translation.title,
                short_description=translation.short_description,
                description=translation.description
            )
            db.add(db_translation)
    
    # Add images
    if project.images:
        for image in project.images:
            db_image = ProjectImage(
                project_id=db_project.id,
                image_url=str(image.image_url),
                caption=image.caption,
                display_order=image.display_order
            )
            db.add(db_image)
    
    db.commit()
    db.refresh(db_project)
    
    return db_project


def update_project(
    db: Session,
    project_id: uuid.UUID,
    project_update: ProjectUpdate
) -> Optional[Project]:
    """
    Update a project
    
    Args:
        db: Database session
        project_id: Project ID
        project_update: Project update schema
        
    Returns:
        Updated project or None
    """
    db_project = get_project_by_id(db, project_id)
    
    if not db_project:
        return None
    
    update_data = project_update.model_dump(exclude_unset=True, exclude={"technology_ids"})
    
    # Convert URLs to strings
    for url_field in ["cover_image", "github_url", "demo_url"]:
        if url_field in update_data and update_data[url_field]:
            update_data[url_field] = str(update_data[url_field])
    
    for field, value in update_data.items():
        setattr(db_project, field, value)
    
    # Update technologies if provided
    if project_update.technology_ids is not None:
        # Remove existing technologies
        db.query(ProjectTechnology).filter(
            ProjectTechnology.project_id == project_id
        ).delete()
        
        # Add new technologies
        for tech_id in project_update.technology_ids:
            db_project_tech = ProjectTechnology(
                project_id=project_id,
                technology_id=tech_id
            )
            db.add(db_project_tech)
    
    db.commit()
    db.refresh(db_project)
    
    return db_project


def delete_project(db: Session, project_id: uuid.UUID) -> bool:
    """
    Delete a project
    
    Args:
        db: Database session
        project_id: Project ID
        
    Returns:
        True if deleted, False if not found
    """
    db_project = get_project_by_id(db, project_id)
    
    if not db_project:
        return False
    
    db.delete(db_project)
    db.commit()
    
    return True


def get_project_count(db: Session, featured_only: bool = False) -> int:
    """Get total count of projects"""
    query = db.query(func.count(Project.id))
    
    if featured_only:
        query = query.filter(Project.featured == True)
    
    return query.scalar()


def add_project_translation(
    db: Session,
    project_id: uuid.UUID,
    translation: ProjectTranslationCreate
) -> Optional[ProjectTranslation]:
    """Add or update a project translation"""
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        return None
    
    existing = db.query(ProjectTranslation).filter(
        ProjectTranslation.project_id == project_id,
        ProjectTranslation.language == translation.language
    ).first()
    
    if existing:
        existing.title = translation.title
        existing.short_description = translation.short_description
        existing.description = translation.description
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db_translation = ProjectTranslation(
            project_id=project_id,
            language=translation.language,
            title=translation.title,
            short_description=translation.short_description,
            description=translation.description
        )
        db.add(db_translation)
        db.commit()
        db.refresh(db_translation)
        return db_translation
