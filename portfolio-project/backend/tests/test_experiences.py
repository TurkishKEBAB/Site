"""Experiences endpoint tests."""


def test_get_experiences_public_and_grouped(client, create_experience):
    create_experience(title="Engineer", experience_type="work")
    create_experience(title="BSc", experience_type="education")

    listed = client.get("/api/v1/experiences/")
    filtered = client.get("/api/v1/experiences/?experience_type=work")
    grouped = client.get("/api/v1/experiences/by-type")

    assert listed.status_code == 200
    assert listed.json()["total"] == 2
    assert filtered.status_code == 200
    assert filtered.json()["total"] == 1
    assert grouped.status_code == 200
    assert "work" in grouped.json()


def test_get_experience_by_id_and_not_found(client, create_experience, invalid_uuid):
    exp = create_experience(title="Volunteer", experience_type="volunteer")

    ok = client.get(f"/api/v1/experiences/{exp.id}")
    missing = client.get(f"/api/v1/experiences/{invalid_uuid}")

    assert ok.status_code == 200
    assert ok.json()["title"] == "Volunteer"
    assert missing.status_code == 404


def test_create_update_delete_experience(client, admin_headers):
    created = client.post(
        "/api/v1/experiences/",
        headers=admin_headers,
        json={
            "title": "DevOps Engineer",
            "organization": "Example Corp",
            "location": "Istanbul",
            "experience_type": "work",
            "start_date": "2023-01-01",
            "is_current": True,
            "description": "Managed CI/CD",
            "display_order": 1,
        },
    )
    assert created.status_code == 201
    experience_id = created.json()["id"]

    updated = client.put(
        f"/api/v1/experiences/{experience_id}",
        headers=admin_headers,
        json={"title": "Senior DevOps Engineer", "is_current": False},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Senior DevOps Engineer"

    deleted = client.delete(f"/api/v1/experiences/{experience_id}", headers=admin_headers)
    assert deleted.status_code == 204


def test_experience_admin_endpoints_require_admin(client, user_headers):
    payload = {
        "title": "Unauthorized",
        "organization": "Org",
        "experience_type": "work",
        "start_date": "2022-01-01",
    }

    unauth = client.post("/api/v1/experiences/", json=payload)
    forbidden = client.post("/api/v1/experiences/", headers=user_headers, json=payload)

    assert unauth.status_code == 401
    assert forbidden.status_code == 403
