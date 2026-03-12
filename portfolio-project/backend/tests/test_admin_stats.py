"""Admin stats endpoint tests."""

from datetime import date

from app.models.project import Project
from app.models.skill import Skill
from app.models.experience import Experience
from app.models.contact import ContactMessage


def test_admin_stats_unauthorized(client):
    """Test that admin stats requires authentication"""
    response = client.get("/api/v1/admin/stats")
    assert response.status_code == 401


def test_admin_stats_forbidden_regular_user(client, user_headers):
    """Test that admin stats is forbidden for regular users"""
    response = client.get("/api/v1/admin/stats", headers=user_headers)
    assert response.status_code == 403


def test_admin_stats_success(client, admin_headers, db_session):
    """Test admin stats returns correct counts"""
    # Create test data
    project = Project(
        slug="test-project",
        title="Test Project",
        description="Test Description"
    )
    db_session.add(project)
    
    skill = Skill(
        name="Python",
        category="Backend",
        proficiency=90
    )
    db_session.add(skill)
    
    experience = Experience(
        title="Developer",
        organization="Test Corp",
        experience_type="work",
        start_date=date(2020, 1, 1),
        is_current=True,
        display_order=0
    )
    db_session.add(experience)
    
    message = ContactMessage(
        name="Test User",
        email="test@example.com",
        subject="Test",
        message="Test message",
        is_read=False
    )
    db_session.add(message)
    
    db_session.commit()
    
    # Test endpoint
    response = client.get("/api/v1/admin/stats", headers=admin_headers)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["projects"] == 1
    assert data["skills"] == 1
    assert data["experiences"] == 1
    assert data["messages"] == 1
    assert data["unread_messages"] == 1


def test_admin_stats_empty(client, admin_headers):
    """Test admin stats with no data"""
    response = client.get("/api/v1/admin/stats", headers=admin_headers)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["projects"] == 0
    assert data["skills"] == 0
    assert data["experiences"] == 0
    assert data["messages"] == 0
    assert data["unread_messages"] == 0
