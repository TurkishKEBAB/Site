"""
Projects Admin Endpoint Tests
Test project CRUD operations with admin authentication
"""
import pytest


def test_create_project_unauthorized(client):
    """Test that creating a project requires authentication"""
    response = client.post("/api/v1/projects/", json={
        "title": "Test Project",
        "slug": "test-project",
        "description": "Test Description"
    })
    assert response.status_code == 401


def test_create_project_forbidden_regular_user(client, user_headers):
    """Test that creating a project is forbidden for regular users"""
    response = client.post(
        "/api/v1/projects/",
        json={
            "title": "Test Project",
            "slug": "test-project",
            "description": "Test Description"
        },
        headers=user_headers
    )
    assert response.status_code == 403


def test_create_project_success(client, admin_headers):
    """Test successful project creation by admin"""
    response = client.post(
        "/api/v1/projects/",
        json={
            "title": "Test Project",
            "slug": "test-project",
            "description": "Test Description",
            "short_description": "Short desc",
            "featured": True,
            "display_order": 1
        },
        headers=admin_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    
    assert data["title"] == "Test Project"
    assert data["slug"] == "test-project"
    assert data["description"] == "Test Description"
    assert data["featured"] is True
    assert "id" in data


def test_get_projects_public(client, db_session):
    """Test that getting projects list works without authentication"""
    # Create a project first
    from app.models.project import Project
    
    project = Project(
        slug="public-project",
        title="Public Project",
        description="Public Description"
    )
    db_session.add(project)
    db_session.commit()
    
    response = client.get("/api/v1/projects/")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "items" in data
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Public Project"


def test_update_project_unauthorized(client, db_session):
    """Test that updating a project requires authentication"""
    from app.models.project import Project
    
    project = Project(
        slug="test-project",
        title="Test Project",
        description="Test Description"
    )
    db_session.add(project)
    db_session.commit()
    
    response = client.put(
        f"/api/v1/projects/{project.id}",
        json={"title": "Updated Title"}
    )
    
    assert response.status_code == 401


def test_update_project_success(client, admin_headers, db_session):
    """Test successful project update by admin"""
    from app.models.project import Project
    
    project = Project(
        slug="test-project",
        title="Test Project",
        description="Test Description"
    )
    db_session.add(project)
    db_session.commit()
    
    response = client.put(
        f"/api/v1/projects/{project.id}",
        json={
            "title": "Updated Title",
            "description": "Updated Description",
            "featured": True
        },
        headers=admin_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["title"] == "Updated Title"
    assert data["description"] == "Updated Description"
    assert data["featured"] is True


def test_delete_project_unauthorized(client, db_session):
    """Test that deleting a project requires authentication"""
    from app.models.project import Project
    
    project = Project(
        slug="test-project",
        title="Test Project",
        description="Test Description"
    )
    db_session.add(project)
    db_session.commit()
    
    response = client.delete(f"/api/v1/projects/{project.id}")
    
    assert response.status_code == 401


def test_delete_project_success(client, admin_headers, db_session):
    """Test successful project deletion by admin"""
    from app.models.project import Project
    
    project = Project(
        slug="test-project",
        title="Test Project",
        description="Test Description"
    )
    db_session.add(project)
    db_session.commit()
    project_id = project.id
    
    response = client.delete(
        f"/api/v1/projects/{project_id}",
        headers=admin_headers
    )
    
    assert response.status_code == 204
    
    # Verify project is deleted
    db_session.expire_all()
    deleted_project = db_session.query(Project).filter(Project.id == project_id).first()
    assert deleted_project is None
