"""Projects endpoint tests."""

import io

from PIL import Image
from sqlalchemy import event

from app.api.v1 import projects as projects_api
from app.crud import project as project_crud
from app.models.project import ProjectImage


def _build_png_bytes(size: tuple[int, int] = (1, 1)) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", size, color=(0, 0, 0)).save(buffer, format="PNG")
    return buffer.getvalue()


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
    assert list_response.headers["cache-control"] == (
        "public, max-age=60, stale-while-revalidate=300"
    )
    assert detail_response.headers["cache-control"] == (
        "public, max-age=60, stale-while-revalidate=300"
    )
    assert list_response.json()["total"] == 1
    assert detail_response.json()["slug"] == "public-project"


def test_public_project_list_omits_detail_collections(client, create_project):
    create_project(slug="compact-project")

    response = client.get("/api/v1/projects?language=en")

    assert response.status_code == 200
    item = response.json()["items"][0]
    assert "translations" not in item
    assert "images" not in item
    assert "technologies" in item


def test_get_projects_accepts_canonical_no_slash_path(client, create_project):
    create_project(slug="canonical-project")

    response = client.get(
        "/api/v1/projects?language=en",
        follow_redirects=False,
    )

    assert response.status_code == 200
    assert "location" not in response.headers


def test_project_list_loads_collections_without_join_explosion(
    db_session, create_project
):
    create_project(slug="list-performance-project")
    statements = []

    def record_select(_conn, _cursor, statement, _parameters, _context, _executemany):
        if statement.lstrip().upper().startswith("SELECT"):
            statements.append(statement)

    event.listen(db_session.bind, "before_cursor_execute", record_select)
    try:
        project_crud.get_projects(db_session, limit=100, language="en")
    finally:
        event.remove(db_session.bind, "before_cursor_execute", record_select)

    assert len(statements) >= 3


def test_project_list_does_not_lazy_load_technologies_per_project(
    client, db_session, create_project
):
    create_project(slug="technology-query-one")
    create_project(slug="technology-query-two")
    create_project(slug="technology-query-three")
    statements = []

    def record_select(_conn, _cursor, statement, _parameters, _context, _executemany):
        if statement.lstrip().upper().startswith("SELECT"):
            statements.append(statement)

    event.listen(db_session.bind, "before_cursor_execute", record_select)
    try:
        response = client.get("/api/v1/projects?language=en&limit=100")
    finally:
        event.remove(db_session.bind, "before_cursor_execute", record_select)

    assert response.status_code == 200
    assert len(statements) <= 5


def test_project_list_uses_server_cache_for_repeated_requests(
    client, create_project, monkeypatch
):
    create_project(slug="cached-project")
    cache = {}

    class DummyCache:
        async def get(self, key):
            return cache.get(key)

        async def set(self, key, value, ttl=3600):
            cache[key] = value

        async def increment(self, key, amount=1):
            cache[key] = int(cache.get(key, 0)) + amount
            return cache[key]

    monkeypatch.setattr(
        projects_api,
        "get_cache_service",
        lambda: DummyCache(),
        raising=False,
    )
    original_get_projects = project_crud.get_projects
    calls = 0

    def counted_get_projects(*args, **kwargs):
        nonlocal calls
        calls += 1
        return original_get_projects(*args, **kwargs)

    monkeypatch.setattr(project_crud, "get_projects", counted_get_projects)

    first = client.get("/api/v1/projects?language=en&limit=100")
    second = client.get("/api/v1/projects?language=en&limit=100")

    assert first.status_code == 200
    assert second.status_code == 200
    assert second.json() == first.json()
    assert calls == 1


def test_project_writes_invalidate_list_cache(client, admin_headers, create_project, monkeypatch):
    project = create_project(slug="invalidate-project")
    invalidations = []

    class DummyCache:
        async def get(self, _key):
            return None

        async def set(self, _key, _value, ttl=3600):
            return None

        async def increment(self, key, amount=1):
            invalidations.append((key, amount))
            return amount

    monkeypatch.setattr(projects_api, "get_cache_service", lambda: DummyCache())

    response = client.put(
        f"/api/v1/projects/{project.id}",
        json={"title": "Invalidated project"},
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert invalidations == [(projects_api.PROJECT_LIST_CACHE_VERSION_KEY, 1)]


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

        def validate_file_content(self, file_data, allowed_mimes=None):
            return True, ""

        async def upload_file(self, file_path, file_data, content_type, optimize):
            return "https://example.com/project-image.jpg"

    monkeypatch.setattr("app.api.v1.projects.StorageService", DummyStorage)

    upload = client.post(
        f"/api/v1/projects/{project.id}/upload-image",
        headers=admin_headers,
        files={"file": ("image.jpg", _build_png_bytes(), "image/jpeg")},
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

        def validate_file_content(self, file_data, allowed_mimes=None):
            return True, ""

    monkeypatch.setattr("app.api.v1.projects.StorageService", DummyStorage)

    response = client.post(
        f"/api/v1/projects/{project.id}/upload-image",
        headers=admin_headers,
        files={"file": ("script.sh", b"echo hi", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid file type"


def test_upload_project_image_rejects_disguised_payload(
    client, admin_headers, create_project
):
    """Renaming a non-image binary to .jpg must be rejected by magic-byte check."""

    project = create_project(slug="disguised-image-project")

    response = client.post(
        f"/api/v1/projects/{project.id}/upload-image",
        headers=admin_headers,
        files={"file": ("totally-an-image.jpg", b"<html>not an image</html>", "image/jpeg")},
    )

    assert response.status_code == 400
    assert "allowed type" in response.json()["detail"].lower()


def test_delete_project_success(client, admin_headers, create_project):
    project = create_project(slug="delete-project")

    response = client.delete(f"/api/v1/projects/{project.id}", headers=admin_headers)

    assert response.status_code == 204
    missing = client.get("/api/v1/projects/delete-project")
    assert missing.status_code == 404
