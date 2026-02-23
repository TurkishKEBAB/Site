"""Translations and config endpoint tests."""


def test_get_translations_public_endpoints(client, create_translation):
    create_translation(language="en", key="hero.title", value="Hello")
    create_translation(language="tr", key="hero.title", value="Merhaba")

    all_translations = client.get("/api/v1/translations/")
    en_translations = client.get("/api/v1/translations/en")
    languages = client.get("/api/v1/translations/languages/available")

    assert all_translations.status_code == 200
    assert en_translations.status_code == 200
    assert en_translations.json()["hero.title"] == "Hello"
    assert languages.status_code == 200
    assert set(languages.json()["languages"]) == {"en", "tr"}


def test_get_translations_not_found_for_language(client):
    response = client.get("/api/v1/translations/en")
    assert response.status_code == 404


def test_update_set_and_delete_translation(client, admin_headers):
    bulk = client.put(
        "/api/v1/translations/en",
        headers=admin_headers,
        json={"translations": {"nav.home": "Home", "nav.blog": "Blog"}},
    )
    assert bulk.status_code == 200
    assert bulk.json()["updated_count"] == 2

    single = client.post(
        "/api/v1/translations/en/nav.contact",
        headers=admin_headers,
        params={"value": "Contact"},
    )
    assert single.status_code == 200
    assert single.json()["translation"]["key"] == "nav.contact"

    deleted = client.delete(
        "/api/v1/translations/en/nav.contact",
        headers=admin_headers,
    )
    assert deleted.status_code == 204


def test_update_translations_missing_payload(client, admin_headers):
    response = client.put("/api/v1/translations/en", headers=admin_headers, json={"translations": {}})
    assert response.status_code == 400


def test_translation_delete_missing_returns_404(client, admin_headers):
    response = client.delete("/api/v1/translations/en/missing.key", headers=admin_headers)
    assert response.status_code == 404


def test_site_config_crud(client, admin_headers):
    set_config = client.post(
        "/api/v1/translations/config",
        headers=admin_headers,
        json={"key": "site_name", "value": "My Portfolio", "description": "Shown in header"},
    )
    assert set_config.status_code == 200

    get_one = client.get("/api/v1/translations/config/site_name")
    get_all = client.get("/api/v1/translations/config/all")

    assert get_one.status_code == 200
    assert get_one.json()["value"] == "My Portfolio"
    assert get_all.status_code == 200
    assert get_all.json()["site_name"] == "My Portfolio"

    delete_config = client.delete("/api/v1/translations/config/site_name", headers=admin_headers)
    missing_config = client.get("/api/v1/translations/config/site_name")

    assert delete_config.status_code == 204
    assert missing_config.status_code == 404


def test_translation_and_config_admin_endpoints_require_admin(client, user_headers):
    set_translation = client.post(
        "/api/v1/translations/en/sample.key",
        params={"value": "Sample"},
    )
    set_config = client.post(
        "/api/v1/translations/config",
        headers=user_headers,
        json={"key": "theme", "value": "light"},
    )

    assert set_translation.status_code == 401
    assert set_config.status_code == 403
