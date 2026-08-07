"""Seed data security regression tests."""

import pytest
from app.models.user import User
from app.models.experience import Experience
from app.models.blog import BlogPost, BlogTranslation
from app.models.project import ProjectTranslation
from seed_data import seed_admin_user, seed_blog_posts, seed_experiences, seed_projects


def test_seed_admin_user_requires_explicit_password(
    db_session,
    monkeypatch,
    capsys,
):
    monkeypatch.delenv("SEED_ADMIN_PASSWORD", raising=False)

    with pytest.raises(RuntimeError, match="SEED_ADMIN_PASSWORD is required"):
        seed_admin_user(db_session)

    captured = capsys.readouterr()
    assert "Generated seed admin password" not in captured.out
    assert db_session.query(User).count() == 0


def test_seed_admin_user_uses_environment_password(db_session, monkeypatch):
    monkeypatch.setenv("SEED_ADMIN_PASSWORD", "explicit-seed-password")

    user = seed_admin_user(db_session)

    assert user.email == "yigitokur@ieee.org"
    assert db_session.query(User).count() == 1


def test_seed_experiences_excludes_removed_adalab_record(db_session):
    seed_experiences(db_session)

    organizations = [experience.organization for experience in db_session.query(Experience).all()]

    assert organizations
    assert not any("adalab" in organization.lower() for organization in organizations)


def test_seed_translations_use_diacritics_and_real_turkish_copy(db_session, admin_user):
    seed_experiences(db_session)
    seed_projects(db_session)
    seed_blog_posts(db_session, admin_user)

    experience = db_session.query(Experience).filter(Experience.title == "B.Sc. Software Engineering").one()
    experience_tr = next(item for item in experience.translations if item.language == "tr")
    assert experience_tr.title == "Yazılım Mühendisliği Lisans Programı"
    assert experience_tr.location == "İstanbul, Türkiye"

    project_tr = (
        db_session.query(ProjectTranslation)
        .filter(ProjectTranslation.language == "tr")
        .filter(ProjectTranslation.title == "Portfolyo Platformu (Web + Masaüstü)")
        .one()
    )
    assert "operasyonları" in project_tr.short_description

    blog = db_session.query(BlogPost).filter(BlogPost.slug == "neta-timezone-investigation").one()
    blog_tr = db_session.query(BlogTranslation).filter(BlogTranslation.blog_post_id == blog.id).one()
    assert blog_tr.title == "Kurumsal Mikroservislerde Sessiz Bir Saat Dilimi Hatasını Ayıklamak"
    assert blog_tr.title != blog.title
