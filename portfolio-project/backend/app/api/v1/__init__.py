"""
API v1 Router
Combines all v1 endpoints
"""
from fastapi import APIRouter

from app.api.v1 import auth, blog, projects, skills, experiences, contact, github, translations, admin, technologies

# Create main v1 router
api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(blog.router, prefix="/blog", tags=["Blog"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(skills.router, prefix="/skills", tags=["Skills"])
api_router.include_router(experiences.router, prefix="/experiences", tags=["Experiences"])
api_router.include_router(contact.router, prefix="/contact", tags=["Contact"])
api_router.include_router(github.router, prefix="/github", tags=["GitHub"])
api_router.include_router(translations.router, prefix="/translations", tags=["Translations"])
api_router.include_router(technologies.router, prefix="/technologies", tags=["Technologies"])
