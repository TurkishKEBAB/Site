"""Technologies endpoint tests."""


def test_get_technologies_public(client, create_technology):
    create_technology(name="Python", slug="python", category="language")
    create_technology(name="FastAPI", slug="fastapi", category="framework")

    listed = client.get("/api/v1/technologies/")
    filtered = client.get("/api/v1/technologies/?category=language")

    assert listed.status_code == 200
    assert len(listed.json()) == 2
    assert filtered.status_code == 200
    assert len(filtered.json()) == 1


def test_get_technology_not_found(client, invalid_uuid):
    response = client.get(f"/api/v1/technologies/{invalid_uuid}")
    assert response.status_code == 404


def test_create_update_delete_technology(client, admin_headers):
    created = client.post(
        "/api/v1/technologies/",
        headers=admin_headers,
        json={
            "name": "Terraform",
            "slug": "terraform",
            "category": "tool",
            "color": "#3B82F6",
        },
    )
    assert created.status_code == 201
    technology_id = created.json()["id"]

    updated = client.put(
        f"/api/v1/technologies/{technology_id}",
        headers=admin_headers,
        json={"name": "Terraform Cloud", "slug": "terraform-cloud"},
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Terraform Cloud"

    deleted = client.delete(f"/api/v1/technologies/{technology_id}", headers=admin_headers)
    assert deleted.status_code == 204


def test_technology_duplicate_conflicts(client, admin_headers):
    first = client.post(
        "/api/v1/technologies/",
        headers=admin_headers,
        json={"name": "Docker", "slug": "docker", "category": "tool", "color": "#0000FF"},
    )
    duplicate = client.post(
        "/api/v1/technologies/",
        headers=admin_headers,
        json={"name": "Docker", "slug": "docker-2", "category": "tool", "color": "#FF0000"},
    )

    assert first.status_code == 201
    assert duplicate.status_code == 400


def test_technology_admin_endpoints_require_admin(client, user_headers):
    payload = {"name": "Ansible", "slug": "ansible", "category": "tool", "color": "#123456"}

    unauth = client.post("/api/v1/technologies/", json=payload)
    forbidden = client.post("/api/v1/technologies/", headers=user_headers, json=payload)

    assert unauth.status_code == 401
    assert forbidden.status_code == 403
