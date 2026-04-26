"""Admin action audit tests."""

from app.models.admin import AdminActionLog


def test_project_create_records_admin_action(client, admin_headers, db_session):
    response = client.post(
        "/api/v1/projects/",
        json={
            "title": "Audited Project",
            "slug": "audited-project",
            "description": "Project Description",
            "short_description": "Short desc",
        },
        headers=admin_headers,
    )

    assert response.status_code == 201
    project_id = response.json()["id"]

    log = db_session.query(AdminActionLog).one()
    assert log.action == "project.create"
    assert log.target_type == "project"
    assert log.target_id == project_id
    assert log.actor_id is not None
    assert log.details == {"slug": "audited-project"}
