from datetime import date, timedelta
from typing import Callable
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import app.models as app_models  # noqa: F401
from app import main as main_module
from app.api.deps import get_db
from app.config import settings
from app.core.rate_limit import limiter
from app.crud import user as user_crud
from app.database import Base
from app.main import app
from app.models.blog import BlogPost
from app.models.contact import ContactMessage
from app.models.experience import Experience
from app.models.project import Project
from app.models.site import Translation
from app.models.skill import Skill
from app.models.technology import Technology
from app.schemas.user import UserCreate
from app.utils.security import create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite://"


@pytest.fixture(scope="session")
def engine():
    return create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


@pytest.fixture(scope="session")
def SessionLocal(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def configure_admin_emails():
    previous_admin_emails = settings.ADMIN_EMAILS
    settings.ADMIN_EMAILS = "admin@test.com"
    try:
        yield
    finally:
        settings.ADMIN_EMAILS = previous_admin_emails


@pytest.fixture(autouse=True)
def reset_rate_limiter_storage():
    storage = getattr(limiter, "_storage", None)
    reset_fn = getattr(storage, "reset", None)
    if callable(reset_fn):
        reset_fn()
    yield
    if callable(reset_fn):
        reset_fn()


@pytest.fixture(scope="function")
def db_session(engine, SessionLocal):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session, monkeypatch):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    class DummyCache:
        redis_client = None

        async def connect(self):
            return None

        async def disconnect(self):
            return None

    monkeypatch.setattr(main_module, "get_cache_service", lambda: DummyCache())
    monkeypatch.setattr(main_module, "check_db_connection", lambda: True)
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def create_user(db_session: Session) -> Callable[..., object]:
    def _create_user(
        *,
        email: str,
        username: str,
        password: str = "testpass123",
    ):
        return user_crud.create_user(
            db_session,
            UserCreate(
                email=email,
                username=username,
                password=password,
            ),
        )

    return _create_user


@pytest.fixture
def admin_user(create_user):
    return create_user(email="admin@test.com", username="admin")


@pytest.fixture
def regular_user(create_user):
    return create_user(email="user@test.com", username="regular")


@pytest.fixture
def admin_token(admin_user):
    return create_access_token(data={"sub": str(admin_user.id)}, expires_delta=timedelta(minutes=30))


@pytest.fixture
def user_token(regular_user):
    return create_access_token(data={"sub": str(regular_user.id)}, expires_delta=timedelta(minutes=30))


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def user_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture
def create_project(db_session: Session):
    counter = {"value": 0}

    def _create_project(**overrides):
        counter["value"] += 1
        idx = counter["value"]
        project = Project(
            slug=overrides.get("slug", f"project-{idx}"),
            title=overrides.get("title", f"Project {idx}"),
            short_description=overrides.get("short_description", "Short description"),
            description=overrides.get("description", "Project description"),
            featured=overrides.get("featured", False),
            display_order=overrides.get("display_order", idx),
        )
        db_session.add(project)
        db_session.commit()
        db_session.refresh(project)
        return project

    return _create_project


@pytest.fixture
def create_skill(db_session: Session):
    counter = {"value": 0}

    def _create_skill(**overrides):
        counter["value"] += 1
        idx = counter["value"]
        skill = Skill(
            name=overrides.get("name", f"Skill {idx}"),
            category=overrides.get("category", "Backend"),
            proficiency=overrides.get("proficiency", 80),
            display_order=overrides.get("display_order", idx),
        )
        db_session.add(skill)
        db_session.commit()
        db_session.refresh(skill)
        return skill

    return _create_skill


@pytest.fixture
def create_experience(db_session: Session):
    counter = {"value": 0}

    def _create_experience(**overrides):
        counter["value"] += 1
        idx = counter["value"]
        experience = Experience(
            title=overrides.get("title", f"Experience {idx}"),
            organization=overrides.get("organization", "Example Org"),
            location=overrides.get("location", "Istanbul"),
            experience_type=overrides.get("experience_type", "work"),
            start_date=overrides.get("start_date", date(2024, 1, 1)),
            end_date=overrides.get("end_date", None),
            is_current=overrides.get("is_current", True),
            description=overrides.get("description", "Experience description"),
            display_order=overrides.get("display_order", idx),
        )
        db_session.add(experience)
        db_session.commit()
        db_session.refresh(experience)
        return experience

    return _create_experience


@pytest.fixture
def create_contact_message(db_session: Session):
    counter = {"value": 0}

    def _create_contact_message(**overrides):
        counter["value"] += 1
        idx = counter["value"]
        message = ContactMessage(
            name=overrides.get("name", f"User {idx}"),
            email=overrides.get("email", f"user{idx}@example.com"),
            subject=overrides.get("subject", f"Subject {idx}"),
            message=overrides.get("message", "Hello from tests"),
            is_read=overrides.get("is_read", False),
            is_replied=overrides.get("is_replied", False),
        )
        db_session.add(message)
        db_session.commit()
        db_session.refresh(message)
        return message

    return _create_contact_message


@pytest.fixture
def create_blog_post(db_session: Session, admin_user):
    counter = {"value": 0}

    def _create_blog_post(**overrides):
        counter["value"] += 1
        idx = counter["value"]
        post = BlogPost(
            slug=overrides.get("slug", f"post-{idx}"),
            title=overrides.get("title", f"Post {idx}"),
            content=overrides.get("content", "Sample content"),
            excerpt=overrides.get("excerpt", "Sample excerpt"),
            author_id=overrides.get("author_id", admin_user.id),
            published=overrides.get("published", True),
            reading_time=overrides.get("reading_time", 5),
            views=overrides.get("views", 0),
        )
        db_session.add(post)
        db_session.commit()
        db_session.refresh(post)
        return post

    return _create_blog_post


@pytest.fixture
def create_technology(db_session: Session):
    counter = {"value": 0}

    def _create_technology(**overrides):
        counter["value"] += 1
        idx = counter["value"]
        tech = Technology(
            name=overrides.get("name", f"Technology {idx}"),
            slug=overrides.get("slug", f"tech-{idx}"),
            icon=overrides.get("icon", None),
            category=overrides.get("category", "tool"),
            color=overrides.get("color", "#3B82F6"),
        )
        db_session.add(tech)
        db_session.commit()
        db_session.refresh(tech)
        return tech

    return _create_technology


@pytest.fixture
def create_translation(db_session: Session):
    def _create_translation(*, language: str, key: str, value: str):
        translation = Translation(
            language=language,
            translation_key=key,
            value=value,
        )
        db_session.add(translation)
        db_session.commit()
        db_session.refresh(translation)
        return translation

    return _create_translation


@pytest.fixture
def invalid_uuid() -> str:
    return str(uuid.uuid4())
