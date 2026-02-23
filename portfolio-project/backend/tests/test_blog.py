"""Blog endpoint tests."""


def test_get_blog_posts_and_search(client, create_blog_post):
    create_blog_post(slug="published-post", title="Published Post", content="python fastapi", published=True)
    create_blog_post(slug="draft-post", title="Draft Post", content="secret", published=False)

    listed = client.get("/api/v1/blog/?language=en")
    search = client.get("/api/v1/blog/search?q=python")

    assert listed.status_code == 200
    assert listed.json()["total"] == 1
    assert listed.json()["items"][0]["slug"] == "published-post"
    assert search.status_code == 200
    assert len(search.json()) == 1


def test_get_blog_post_increments_views(client, create_blog_post):
    create_blog_post(slug="viewed-post", views=0)

    first = client.get("/api/v1/blog/viewed-post")
    second = client.get("/api/v1/blog/viewed-post")

    assert first.status_code == 200
    assert second.status_code == 200
    assert second.json()["views"] == 2


def test_get_blog_post_not_found(client):
    response = client.get("/api/v1/blog/missing-post")
    assert response.status_code == 404


def test_create_update_delete_blog_post(client, admin_headers):
    created = client.post(
        "/api/v1/blog/",
        headers=admin_headers,
        json={
            "slug": "created-post",
            "title": "Created Post",
            "content": "A" * 300,
            "excerpt": "Excerpt",
            "published": True,
        },
    )
    assert created.status_code == 201
    post_id = created.json()["id"]

    updated = client.put(
        f"/api/v1/blog/{post_id}",
        headers=admin_headers,
        json={"title": "Updated Post", "published": False},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Updated Post"

    deleted = client.delete(f"/api/v1/blog/{post_id}", headers=admin_headers)
    assert deleted.status_code == 204


def test_blog_admin_routes_require_admin(client, user_headers):
    payload = {
        "title": "Unauthorized",
        "content": "text",
        "excerpt": "text",
    }

    unauth = client.post("/api/v1/blog/", json=payload)
    forbidden = client.post("/api/v1/blog/", headers=user_headers, json=payload)

    assert unauth.status_code == 401
    assert forbidden.status_code == 403


def test_add_blog_translation_success_and_not_found(client, admin_headers, create_blog_post, invalid_uuid):
    post = create_blog_post(slug="translation-post")

    ok = client.post(
        f"/api/v1/blog/{post.id}/translations",
        headers=admin_headers,
        json={
            "language": "tr",
            "title": "Ceviri",
            "content": "Icerik",
            "excerpt": "Ozet",
        },
    )
    missing = client.post(
        f"/api/v1/blog/{invalid_uuid}/translations",
        headers=admin_headers,
        json={
            "language": "tr",
            "title": "Ceviri",
            "content": "Icerik",
            "excerpt": "Ozet",
        },
    )

    assert ok.status_code == 200
    assert missing.status_code == 404
