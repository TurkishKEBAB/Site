"""
Pydantic Schemas Initialization
"""
from app.schemas.user import User, UserCreate, UserLogin, Token, TokenData
from app.schemas.blog import (
    BlogPost, BlogPostCreate, BlogPostUpdate, BlogPostDetail,
    BlogTranslation, BlogTranslationCreate
)
from app.schemas.project import (
    Project, ProjectCreate, ProjectUpdate, ProjectDetail,
    ProjectTranslation, ProjectTranslationCreate
)
from app.schemas.technology import Technology, TechnologyCreate
from app.schemas.skill import Skill, SkillCreate, SkillTranslation
from app.schemas.experience import Experience, ExperienceCreate, ExperienceTranslation
from app.schemas.contact import ContactMessage, ContactMessageCreate, ContactMessageResponse
from app.schemas.github import GitHubRepo, GitHubRepoResponse
from app.schemas.site import SiteConfig, Translation, TranslationResponse, PageViewCreate
from app.schemas.admin import AdminStatsResponse

__all__ = [
    "User", "UserCreate", "UserLogin", "Token", "TokenData",
    "BlogPost", "BlogPostCreate", "BlogPostUpdate", "BlogPostDetail",
    "BlogTranslation", "BlogTranslationCreate",
    "Project", "ProjectCreate", "ProjectUpdate", "ProjectDetail",
    "ProjectTranslation", "ProjectTranslationCreate",
    "Technology", "TechnologyCreate",
    "Skill", "SkillCreate", "SkillTranslation",
    "Experience", "ExperienceCreate", "ExperienceTranslation",
    "ContactMessage", "ContactMessageCreate", "ContactMessageResponse",
    "GitHubRepo", "GitHubRepoResponse",
    "SiteConfig", "Translation", "TranslationResponse", "PageViewCreate",
    "AdminStatsResponse",
]
