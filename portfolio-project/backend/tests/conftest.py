"""
Pytest Configuration and Fixtures
Shared test utilities and fixtures
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
import app.models as app_models  # noqa: F401
from app.database import Base, get_db
from app.crud import user as user_crud
from app.schemas.user import UserCreate
from app.utils.security import create_access_token
from datetime import timedelta

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db_session):
    """Create an admin user for testing"""
    user_data = UserCreate(
        email="admin@test.com",
        username="testadmin",
        password="testpass123",
        full_name="Test Admin",
        is_admin=True,
        is_active=True
    )
    user = user_crud.create_user(db_session, user_data)
    return user


@pytest.fixture
def regular_user(db_session):
    """Create a regular user for testing"""
    user_data = UserCreate(
        email="user@test.com",
        username="testuser",
        password="testpass123",
        full_name="Test User",
        is_admin=False,
        is_active=True
    )
    user = user_crud.create_user(db_session, user_data)
    return user


@pytest.fixture
def admin_token(admin_user):
    """Create an admin JWT token"""
    access_token = create_access_token(
        data={"sub": str(admin_user.id)},
        expires_delta=timedelta(minutes=30)
    )
    return access_token


@pytest.fixture
def user_token(regular_user):
    """Create a regular user JWT token"""
    access_token = create_access_token(
        data={"sub": str(regular_user.id)},
        expires_delta=timedelta(minutes=30)
    )
    return access_token


@pytest.fixture
def admin_headers(admin_token):
    """Create headers with admin authorization"""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def user_headers(user_token):
    """Create headers with user authorization"""
    return {"Authorization": f"Bearer {user_token}"}
