"""Experiences endpoint tests."""

from app.models.experience import ExperienceTranslation


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


def test_update_experience_persists_translation_without_overwriting_base_fields(
    client, admin_headers, create_experience, db_session
):
    experience = create_experience(
        title="Software Engineering Intern",
        organization="NETAŞ",
        description="English base description",
    )

    response = client.put(
        f"/api/v1/experiences/{experience.id}",
        headers=admin_headers,
        json={
            "translations": [
                {
                    "language": "tr",
                    "title": "Yazılım Mühendisliği Stajyeri",
                    "organization": "NETAŞ",
                    "location": "İstanbul, Türkiye",
                    "description": "Türkçe deneyim açıklaması",
                }
            ]
        },
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Software Engineering Intern"
    translation = (
        db_session.query(ExperienceTranslation)
        .filter_by(experience_id=experience.id, language="tr")
        .one()
    )
    assert translation.title == "Yazılım Mühendisliği Stajyeri"
    assert translation.description == "Türkçe deneyim açıklaması"


def test_experience_translation_endpoint_upserts_translation(
    client, admin_headers, create_experience, db_session
):
    experience = create_experience()
    payload = {
        "language": "tr",
        "title": "İlk başlık",
        "organization": "İlk kurum",
        "location": "İstanbul",
        "description": "İlk açıklama",
    }

    created = client.post(
        f"/api/v1/experiences/{experience.id}/translations",
        headers=admin_headers,
        json=payload,
    )
    updated = client.post(
        f"/api/v1/experiences/{experience.id}/translations",
        headers=admin_headers,
        json={**payload, "title": "Güncel başlık"},
    )

    assert created.status_code == 200
    assert updated.status_code == 200
    assert (
        db_session.query(ExperienceTranslation)
        .filter_by(experience_id=experience.id, language="tr")
        .count()
        == 1
    )
    assert updated.json()["translations"][-1]["title"] == "Güncel başlık"


def test_create_experience_rejects_duplicate_translation_languages(
    client, admin_headers
):
    response = client.post(
        "/api/v1/experiences/",
        headers=admin_headers,
        json={
            "title": "Software Engineer",
            "organization": "Example",
            "experience_type": "work",
            "start_date": "2025-01-01",
            "translations": [
                {
                    "language": "tr",
                    "title": "Yazılım Mühendisi",
                    "organization": "Örnek",
                },
                {
                    "language": "tr",
                    "title": "Yazılım Mühendisi 2",
                    "organization": "Örnek",
                },
            ],
        },
    )

    assert response.status_code == 422


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
