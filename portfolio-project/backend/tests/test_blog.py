"""Blog endpoint tests."""

from app.api.v1 import blog as blog_api


def test_get_blog_posts_and_search(client, create_blog_post):
    create_blog_post(slug="published-post", title="Published Post", content="python fastapi", published=True)
    create_blog_post(slug="draft-post", title="Draft Post", content="secret", published=False)

    listed = client.get("/api/v1/blog/?language=en")
    search = client.get("/api/v1/blog/search?q=python")

    assert listed.status_code == 200
    assert listed.headers["cache-control"] == (
        "public, max-age=60, stale-while-revalidate=300"
    )
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


def test_public_blog_never_exposes_drafts(client, create_blog_post):
    create_blog_post(
        slug="hidden-draft",
        title="Hidden Draft",
        content="secret",
        published=False,
    )

    listed = client.get("/api/v1/blog/?published_only=true")
    searched = client.get("/api/v1/blog/search?q=Hidden")
    detail = client.get("/api/v1/blog/hidden-draft")

    assert listed.status_code == 200
    assert listed.json()["total"] == 0
    assert searched.status_code == 200
    assert searched.json() == []
    assert detail.status_code == 404


def test_admin_blog_list_is_the_only_draft_list(
    client,
    admin_headers,
    user_headers,
    create_blog_post,
):
    create_blog_post(
        slug="admin-draft",
        title="Admin Draft",
        content="secret",
        published=False,
    )

    forbidden = client.get(
        "/api/v1/blog/?published_only=false",
        headers=user_headers,
    )
    unauthenticated = client.get("/api/v1/blog/admin")
    admin_list = client.get("/api/v1/blog/admin", headers=admin_headers)

    assert forbidden.status_code == 403
    assert unauthenticated.status_code == 401
    assert admin_list.status_code == 200
    assert admin_list.json()["items"][0]["slug"] == "admin-draft"


def test_admin_blog_detail_returns_tags_and_translations(
    client,
    admin_headers,
    create_blog_post,
):
    post = create_blog_post(
        slug="localized-post",
        tags=["python", "fastapi"],
    )
    translated = client.post(
        f"/api/v1/blog/{post.id}/translations",
        headers=admin_headers,
        json={
            "language": "tr",
            "title": "Yerel Yazi",
            "content": "Icerik",
            "excerpt": "Ozet",
        },
    )
    detail = client.get(
        f"/api/v1/blog/admin/{post.id}",
        headers=admin_headers,
    )

    assert translated.status_code == 200
    assert detail.status_code == 200
    assert detail.json()["tags"] == ["python", "fastapi"]
    assert detail.json()["translations"][0]["language"] == "tr"


def test_blog_detail_view_count_is_explicit(client, create_blog_post):
    create_blog_post(slug="view-flag", views=0)

    metadata = client.get("/api/v1/blog/view-flag?count_view=false")
    viewed = client.get("/api/v1/blog/view-flag?count_view=true")

    assert metadata.status_code == 200
    assert metadata.json()["views"] == 0
    assert viewed.status_code == 200
    assert viewed.json()["views"] == 1


def test_blog_view_endpoint_counts_without_loading_content(client, create_blog_post):
    create_blog_post(slug="tracked-post", views=0)

    tracked = client.post("/api/v1/blog/tracked-post/view")
    detail = client.get("/api/v1/blog/tracked-post?count_view=false")

    assert tracked.status_code == 204
    assert detail.status_code == 200
    assert detail.json()["views"] == 1


def test_blog_view_endpoint_is_best_effort(client, create_blog_post, monkeypatch):
    create_blog_post(slug="unavailable-counter")

    def fail_to_increment(*args, **kwargs):
        raise RuntimeError("counter unavailable")

    monkeypatch.setattr(blog_api.blog_crud, "increment_blog_view_count", fail_to_increment)

    response = client.post("/api/v1/blog/unavailable-counter/view")

    assert response.status_code == 204
