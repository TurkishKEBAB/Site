"""Endpoint execution-model contracts for synchronous SQLAlchemy handlers."""

import inspect

import pytest

from app.api.v1 import admin, blog, dossiers, experiences, projects, skills, translations


@pytest.mark.parametrize(
    "handler",
    [
        admin.get_admin_stats,
        blog.get_blog_posts,
        blog.search_blog_posts,
        blog.get_admin_blog_posts,
        blog.get_admin_blog_post,
        blog.get_blog_post,
        dossiers.get_admin_dossier,
        dossiers.save_admin_dossier,
        dossiers.remove_admin_dossier,
        dossiers.get_public_dossier,
        experiences.get_experiences,
        experiences.get_experiences_grouped_by_type,
        experiences.get_experience,
        experiences.create_experience,
        experiences.update_experience,
        experiences.delete_experience,
        projects.get_project,
        skills.get_skills,
        skills.get_skills_by_category,
        skills.get_skill,
        skills.create_skill,
        skills.update_skill,
        skills.delete_skill,
        translations.get_all_translations,
        translations.get_translations,
        translations.get_available_languages,
        translations.update_translations,
        translations.set_translation,
        translations.delete_config,
        translations.delete_translation,
        translations.get_all_config,
        translations.get_config,
        translations.set_config,
    ],
)
def test_sync_database_handlers_run_in_fastapi_threadpool(handler):
    assert not inspect.iscoroutinefunction(handler), handler.__name__
