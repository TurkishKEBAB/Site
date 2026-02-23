"""Projects endpoint tests."""

from app.models.project import ProjectImage


def test_create_project_requires_admin(client, user_headers):
    payload = {
        "title": "Test Project",
        "slug": "test-project",
        "description": "Test Description",
    }

    unauth = client.post("/api/v1/projects/", json=payload)
    forbidden = client.post("/api/v1/projects/", json=payload, headers=user_headers)

    assert unauth.status_code == 401
    assert forbidden.status_code == 403


def test_create_project_success(client, admin_headers):
    response = client.post(
        "/api/v1/projects/",
        json={
            "title": "Test Project",
            "slug": "test-project",
            "description": "Test Description",
            "short_description": "Short desc",
            "featured": True,
            "display_order": 1,
        },
        headers=admin_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Project"
    assert data["slug"] == "test-project"
    assert data["featured"] is True


def test_get_projects_public_and_slug_detail(client, create_project):
    create_project(slug="public-project", title="Public Project", description="Public")

    list_response = client.get("/api/v1/projects/?language=en")
    detail_response = client.get("/api/v1/projects/public-project")

    assert list_response.status_code == 200
    assert detail_response.status_code == 200
    assert list_response.json()["total"] == 1
    assert detail_response.json()["slug"] == "public-project"


def test_get_project_not_found(client):
    response = client.get("/api/v1/projects/missing-project")
    assert response.status_code == 404
    assert response.json()["detail"] == "Project not found"


def test_update_project_success(client, admin_headers, create_project):
    project = create_project(slug="update-project", title="Old Title")

    response = client.put(
        f"/api/v1/projects/{project.id}",
        json={"title": "Updated Title", "description": "Updated Description", "featured": True},
        headers=admin_headers,
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["title"] == "Updated Title"
    assert payload["featured"] is True


def test_update_project_not_found(client, admin_headers, invalid_uuid):
    response = client.put(
        f"/api/v1/projects/{invalid_uuid}",
        json={"title": "Updated"},
        headers=admin_headers,
    )
    assert response.status_code == 404


def test_add_project_translation(client, admin_headers, create_project):
    project = create_project(slug="translation-project")

    response = client.post(
        f"/api/v1/projects/{project.id}/translations",
        json={
            "language": "tr",
            "title": "Ceviri Proje",
            "short_description": "Kisa",
            "description": "Aciklama",
        },
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["slug"] == "translation-project"


def test_upload_update_delete_project_image(client, admin_headers, create_project, db_session, monkeypatch):
    project = create_project(slug="image-project")

    class DummyStorage:
        def validate_file(self, filename, file_size, allowed_extensions):
            return True, ""

        async def upload_file(self, file_path, file_data, content_type, optimize):
            return "https://example.com/project-image.jpg"

    monkeypatch.setattr("app.api.v1.projects.StorageService", DummyStorage)

    upload = client.post(
        f"/api/v1/projects/{project.id}/upload-image",
        headers=admin_headers,
        files={"file": ("image.jpg", b"binary-image", "image/jpeg")},
        data={"caption": "Cover", "display_order": 2},
    )

    assert upload.status_code == 201
    image_id = upload.json()["id"]

    update = client.put(
        f"/api/v1/projects/{project.id}/images/{image_id}",
        headers=admin_headers,
        params={"caption": "Updated Caption", "display_order": 5},
    )
    assert update.status_code == 200
    assert update.json()["caption"] == "Updated Caption"

    delete = client.delete(
        f"/api/v1/projects/{project.id}/images/{image_id}",
        headers=admin_headers,
    )
    assert delete.status_code == 204
    assert db_session.query(ProjectImage).filter(ProjectImage.project_id == project.id).count() == 0


def test_upload_project_image_invalid_extension(client, admin_headers, create_project, monkeypatch):
    project = create_project(slug="invalid-image-project")

    class DummyStorage:
        def validate_file(self, filename, file_size, allowed_extensions):
            return False, "Invalid file type"

    monkeypatch.setattr("app.api.v1.projects.StorageService", DummyStorage)

    response = client.post(
        f"/api/v1/projects/{project.id}/upload-image",
        headers=admin_headers,
        files={"file": ("script.sh", b"echo hi", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid file type"


def test_delete_project_success(client, admin_headers, create_project):
    project = create_project(slug="delete-project")

    response = client.delete(f"/api/v1/projects/{project.id}", headers=admin_headers)

    assert response.status_code == 204
    missing = client.get("/api/v1/projects/delete-project")
    assert missing.status_code == 404
