"""Skills endpoint tests."""


def test_get_skills_and_categories_public(client, create_skill):
    create_skill(name="Python", category="Backend", proficiency=95)
    create_skill(name="React", category="Frontend", proficiency=85)

    listed = client.get("/api/v1/skills/")
    grouped = client.get("/api/v1/skills/by-category")

    assert listed.status_code == 200
    assert listed.json()["total"] == 2
    assert grouped.status_code == 200
    assert "Backend" in grouped.json()
    assert "Frontend" in grouped.json()


def test_get_skill_by_id_and_not_found(client, create_skill, invalid_uuid):
    skill = create_skill(name="Go", category="Backend", proficiency=70)

    ok = client.get(f"/api/v1/skills/{skill.id}")
    missing = client.get(f"/api/v1/skills/{invalid_uuid}")

    assert ok.status_code == 200
    assert ok.json()["name"] == "Go"
    assert missing.status_code == 404


def test_create_update_delete_skill(client, admin_headers):
    created = client.post(
        "/api/v1/skills/",
        headers=admin_headers,
        json={"name": "Docker", "category": "DevOps", "proficiency": 80, "display_order": 1},
    )
    assert created.status_code == 201
    skill_id = created.json()["id"]

    updated = client.put(
        f"/api/v1/skills/{skill_id}",
        headers=admin_headers,
        json={"proficiency": 90},
    )
    assert updated.status_code == 200
    assert updated.json()["proficiency"] == 90

    deleted = client.delete(f"/api/v1/skills/{skill_id}", headers=admin_headers)
    assert deleted.status_code == 204


def test_skill_admin_endpoints_require_admin(client, user_headers):
    payload = {"name": "Kubernetes", "category": "DevOps", "proficiency": 85}

    unauth = client.post("/api/v1/skills/", json=payload)
    forbidden = client.post("/api/v1/skills/", headers=user_headers, json=payload)

    assert unauth.status_code == 401
    assert forbidden.status_code == 403
