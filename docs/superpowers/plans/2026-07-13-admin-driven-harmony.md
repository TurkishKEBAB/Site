# Admin-Driven Site Harmony Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Make editable public portfolio content flow from the backend/admin panel while preserving the NEXUS presentation and delivering the work in independently releasable phases.

**Architecture:** Existing public server components remain the rendering boundary. Public pages read published API data, while the admin client uses protected service methods and local state consistent with the current Admin.tsx pattern. Each domain is migrated independently; static content is removed only after its API-backed replacement has tests and an acceptance path.

**Tech Stack:** FastAPI, SQLAlchemy, Alembic, Pydantic v2, pytest, Next.js App Router, React 19, TypeScript, Axios, TanStack Query, Vitest, Testing Library, Tailwind/NEXUS CSS.

## Global Constraints

- main is the only long-lived development base; work remains on the task-scoped feature branch and never directly on main.
- Every backend model/schema change includes an Alembic migration, backend/openapi.json regeneration, and frontend/src/services/apiTypes.generated.ts regeneration.
- Every behavior change follows red-green-refactor: write a failing test, observe the expected failure, implement the smallest change, and rerun focused plus regression tests.
- Public Blog routes expose published posts only; drafts require admin authorization.
- Blog slugs are create-only in this roadmap; changing a slug requires redirect history and is outside the current scope.
- EN/TR are the first admin UI languages; the backend retains its existing language validation for compatibility.
- The current user modifications in portfolio-project/frontend/app/layout.tsx and portfolio-project/frontend/next-env.d.ts must not be overwritten or staged by this plan.
- Each phase must leave the application green with backend pytest, frontend lint, type-check, tests, and build evidence before completion.
- Commit messages use English Conventional Commits and each commit contains one logical change.

## Repository map

| Area | Responsibility | Phase |
|---|---|---|
| portfolio-project/backend/app/models, schemas, crud, api/v1 | Persistence and HTTP contracts | 1-6 |
| portfolio-project/backend/alembic/versions | PostgreSQL schema history | 1, 4, 5 |
| portfolio-project/backend/tests | API and persistence behavior | 1-6 |
| portfolio-project/frontend/src/services | Typed API boundary and normalization | 1-6 |
| portfolio-project/frontend/src/components/admin | Admin tables, forms, and editors | 1, 2, 4, 6 |
| portfolio-project/frontend/src/routes/Admin.tsx | Admin orchestration and protected mutations | 1, 2, 4, 6 |
| portfolio-project/frontend/src/lib and src/routes | Public data fetching and rendering | 1-6 |
| portfolio-project/frontend/src/content | Temporary fallback/static content | Retired per phase |

---

## Phase 0: Documentation and baseline

### Task 0.1: Record the validated design

**Files:**

- Modify: docs/superpowers/specs/2026-07-13-admin-driven-harmony-plan.md

- [x] Record the current Blog audit accurately: public reads are already API-backed; admin editing and public hardening are the missing pieces.
- [x] Record draft isolation, tags, translations, cache, and view-count requirements.
- [x] Record the six phase boundaries and non-goals.

### Task 0.2: Establish a clean evidence baseline

**Files:**

- Read only: portfolio-project/backend/tests, portfolio-project/frontend/src/test, portfolio-project/frontend/package.json, portfolio-project/quality.ps1

- [ ] Run from portfolio-project:

~~~powershell
python -m pytest backend/tests/test_blog.py -q
~~~

Expected: existing Blog tests complete; record the count and any pre-existing failure.

- [ ] Run from portfolio-project/frontend:

~~~powershell
npm run test -- --run src/services/blogService.test.ts src/hooks/usePublicData.test.tsx src/components/admin/tabs/AdminTabs.test.tsx
~~~

Expected: existing service, hook, and admin-tab tests complete; record the count and any pre-existing failure.

- [ ] Do not edit layout.tsx or next-env.d.ts to make the baseline green.

### Task 0.3: Commit the approved documentation only

**Files:**

- Add: docs/superpowers/plans/2026-07-13-admin-driven-harmony.md
- Modify: docs/superpowers/specs/2026-07-13-admin-driven-harmony-plan.md

- [ ] Verify only documentation paths are staged:

~~~powershell
git diff --cached --name-only
~~~

Expected:

~~~text
docs/superpowers/plans/2026-07-13-admin-driven-harmony.md
docs/superpowers/specs/2026-07-13-admin-driven-harmony-plan.md
~~~

- [ ] Commit:

~~~powershell
git add docs/superpowers/plans/2026-07-13-admin-driven-harmony.md docs/superpowers/specs/2026-07-13-admin-driven-harmony-plan.md
git commit -m "docs(portfolio): define admin-driven harmony phases"
~~~

---

## Phase 1: Blog administration and public hardening

### Phase 1 outcome

An admin can create a draft, verify it is not public, edit content and tags, save EN/TR translations, publish it, see it immediately on /blog, open /blog/[slug], and delete it. A non-admin cannot list or read drafts. Existing public Blog cards, Markdown rendering, degraded state, metadata, and related-post behavior remain intact.

### Task 1.1: Write failing backend contract tests

**Files:**

- Modify: portfolio-project/backend/tests/test_blog.py
- Read: portfolio-project/backend/tests/conftest.py

**Interfaces:**

- Consumes existing client, admin_headers, user_headers, create_blog_post, and invalid_uuid fixtures.
- Produces route and schema tests for Tasks 1.2 and 1.3.

- [ ] Add draft isolation coverage:

~~~python
def test_public_blog_never_exposes_drafts(client, create_blog_post):
    create_blog_post(slug="hidden-draft", title="Hidden Draft", content="secret", published=False)

    listed = client.get("/api/v1/blog/?published_only=true")
    searched = client.get("/api/v1/blog/search?q=Hidden")
    detail = client.get("/api/v1/blog/hidden-draft")

    assert listed.status_code == 200
    assert listed.json()["total"] == 0
    assert searched.status_code == 200
    assert searched.json() == []
    assert detail.status_code == 404
~~~

- [ ] Add protected admin-list coverage:

~~~python
def test_admin_blog_list_is_the_only_draft_list(client, admin_headers, user_headers, create_blog_post):
    create_blog_post(slug="admin-draft", title="Admin Draft", content="secret", published=False)

    forbidden = client.get("/api/v1/blog/?published_only=false", headers=user_headers)
    unauthenticated = client.get("/api/v1/blog/admin")
    admin_list = client.get("/api/v1/blog/admin", headers=admin_headers)

    assert forbidden.status_code == 403
    assert unauthenticated.status_code == 401
    assert admin_list.status_code == 200
    assert admin_list.json()["items"][0]["slug"] == "admin-draft"
~~~

- [ ] Add tags and translation detail coverage:

~~~python
def test_admin_blog_detail_returns_tags_and_translations(client, admin_headers, create_blog_post):
    post = create_blog_post(slug="localized-post", tags=["python", "fastapi"])
    translated = client.post(
        f"/api/v1/blog/{post.id}/translations",
        headers=admin_headers,
        json={"language": "tr", "title": "Yerel Yazi", "content": "Icerik", "excerpt": "Ozet"},
    )
    detail = client.get(f"/api/v1/blog/admin/{post.id}", headers=admin_headers)

    assert translated.status_code == 200
    assert detail.status_code == 200
    assert detail.json()["tags"] == ["python", "fastapi"]
    assert detail.json()["translations"][0]["language"] == "tr"
~~~

- [ ] Add explicit view-count coverage:

~~~python
def test_blog_detail_view_count_is_explicit(client, create_blog_post):
    create_blog_post(slug="view-flag", views=0)

    metadata = client.get("/api/v1/blog/view-flag?count_view=false")
    viewed = client.get("/api/v1/blog/view-flag?count_view=true")

    assert metadata.status_code == 200
    assert metadata.json()["views"] == 0
    assert viewed.status_code == 200
    assert viewed.json()["views"] == 1
~~~

- [ ] Run and observe the expected red state:

~~~powershell
python -m pytest backend/tests/test_blog.py -q
~~~

Expected: failures for draft isolation, admin routes, tags/translations, or explicit view counting.

### Task 1.2: Add Blog tags to persistence and schemas

**Files:**

- Modify: portfolio-project/backend/app/models/blog.py
- Modify: portfolio-project/backend/app/schemas/blog.py
- Modify: portfolio-project/backend/tests/conftest.py only if the factory cannot accept tags
- Create: portfolio-project/backend/alembic/versions/20260713_0004_blog_tags.py

**Interfaces:**

- BlogPost.tags is a non-null JSON array defaulting to [].
- BlogPostCreate accepts tags.
- BlogPostUpdate updates tags but not slug.
- BlogPostDetail exposes tags and translations.

- [ ] Add the SQLAlchemy field:

~~~python
tags = Column(JSON, nullable=False, default=list, server_default="[]")
~~~

- [ ] Add Pydantic fields using per-instance list defaults:

~~~python
tags: List[str] = Field(default_factory=list, max_length=20)
~~~

Add the field to BlogPostBase and BlogPostCreate, and an optional field to BlogPostUpdate. Do not add slug to BlogPostUpdate.

- [ ] Create the migration with revision 20260713_0004 and down revision 20260713_0003:

~~~python
def upgrade() -> None:
    op.add_column(
        "blog_posts",
        sa.Column("tags", sa.JSON(), server_default=sa.text("'[]'"), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("blog_posts", "tags")
~~~

- [ ] Run:

~~~powershell
python -m pytest backend/tests/test_blog.py -q
python -m compileall backend/alembic/versions/20260713_0004_blog_tags.py
~~~

Expected: the migration compiles and remaining red tests are route/CRUD failures.

### Task 1.3: Add protected admin routes and public draft isolation

**Files:**

- Modify: portfolio-project/backend/app/crud/blog.py
- Modify: portfolio-project/backend/app/api/v1/blog.py
- Modify: portfolio-project/backend/app/schemas/blog.py
- Modify: portfolio-project/backend/tests/test_blog.py

**Interfaces:**

- get_blog_post_by_slug(db, slug, language=None, published_only=True) returns None for a draft by default.
- GET /api/v1/blog/admin returns BlogPostList behind require_admin.
- GET /api/v1/blog/admin/{post_id} returns BlogPostDetail behind require_admin.
- POST /api/v1/blog/{post_id}/translations returns BlogPostDetail.
- Public published_only=false requests return 403; the admin UI uses /blog/admin.

- [ ] Implement the CRUD filter:

~~~python
def get_blog_post_by_slug(
    db: Session,
    slug: str,
    language: Optional[str] = None,
    published_only: bool = True,
) -> Optional[BlogPost]:
    query = db.query(BlogPost).options(joinedload(BlogPost.translations)).filter(BlogPost.slug == slug)
    if published_only:
        query = query.filter(BlogPost.published.is_(True))
    post = query.first()
    if not post:
        return None
    return _apply_blog_translation(post, language)
~~~

- [ ] Add admin routes before the dynamic public slug route:

~~~python
@router.get("/admin", response_model=BlogPostListResponse)
async def get_admin_blog_posts(..., current_user: User = Depends(require_admin)):
    posts = blog_crud.get_blog_posts(db, skip=skip, limit=limit, language=language, published_only=False)
    ...


@router.get("/admin/{post_id}", response_model=BlogPostDetail)
async def get_admin_blog_post(post_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    post = blog_crud.get_blog_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post
~~~

Reuse the public pagination calculation; do not duplicate query logic in CRUD and route layers.

- [ ] Add count_view: bool = Query(True) to public detail, pass published_only=True for both reads, and increment views only when count_view is true.
- [ ] Protect published_only=false on the public list without requiring admin for the default published list.
- [ ] Return the full detail shape from translation upsert.
- [ ] Run:

~~~powershell
python -m pytest backend/tests/test_blog.py -q
~~~

Expected: all Blog backend tests pass.

### Task 1.4: Regenerate OpenAPI and frontend API types

**Files:**

- Modify generated: portfolio-project/backend/openapi.json
- Modify generated: portfolio-project/frontend/src/services/apiTypes.generated.ts

- [ ] Run:

~~~powershell
cd portfolio-project
python backend/scripts/export_openapi.py --output backend/openapi.json
cd frontend
npm run gen:api
npm run check:api-types
~~~

Expected: generated files are stable and check:api-types exits with code 0.

- [ ] Commit only the backend contract and generated files:

~~~powershell
git add portfolio-project/backend/app/models/blog.py portfolio-project/backend/app/schemas/blog.py portfolio-project/backend/app/crud/blog.py portfolio-project/backend/app/api/v1/blog.py portfolio-project/backend/tests/test_blog.py portfolio-project/backend/alembic/versions/20260713_0004_blog_tags.py portfolio-project/backend/openapi.json portfolio-project/frontend/src/services/apiTypes.generated.ts
git commit -m "feat(blog): protect drafts and add tags contract"
~~~

### Task 1.5: Extend frontend Blog service and types

**Files:**

- Modify: portfolio-project/frontend/src/services/api.ts
- Modify: portfolio-project/frontend/src/services/types.ts
- Modify: portfolio-project/frontend/src/services/blogService.ts
- Modify: portfolio-project/frontend/src/services/blogService.test.ts

**Interfaces:**

- apiEndpoints.blog.adminList is /blog/admin.
- apiEndpoints.blog.adminDetail(id) is /blog/admin/{id}.
- apiEndpoints.blog.addTranslation(id) is /blog/{id}/translations.
- BlogPost contains tags and optional translations.
- BlogPostCreate contains slug, reading_time, tags, and optional translations.
- blogService.getAdminPosts, getAdminPost, and addTranslation normalize through normalizeBlogPost.

- [ ] Add endpoint mappings:

~~~typescript
adminList: "/blog/admin",
adminDetail: (postId: string) => "/blog/admin/" + postId,
addTranslation: (postId: string) => "/blog/" + postId + "/translations",
~~~

- [ ] Add types:

~~~typescript
export interface BlogTranslation {
  id: string;
  blog_post_id: string;
  language: "en" | "tr" | "de" | "fr";
  title: string;
  content: string;
  excerpt?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostDetail extends BlogPost {
  translations?: BlogTranslation[];
}
~~~

Extend BlogPost and BlogPostCreate with tags and creation fields without removing compatibility aliases.

- [ ] Write failing service tests:

~~~typescript
it("loads drafts through the protected admin list endpoint", async () => {
  vi.spyOn(api, "get").mockResolvedValueOnce({
    data: { items: [], total: 0, page: 1, size: 20, pages: 1 },
  });

  await blogService.getAdminPosts();

  expect(api.get).toHaveBeenCalledWith("/blog/admin", { params: undefined });
});

it("posts an EN/TR translation", async () => {
  vi.spyOn(api, "post").mockResolvedValueOnce({
    data: {
      id: "post-1",
      title: "Post",
      slug: "post",
      content: "Body",
      published: false,
      tags: ["fastapi"],
      translations: [],
      created_at: "2026-07-13",
      updated_at: "2026-07-13",
    },
  });

  await blogService.addTranslation("post-1", {
    language: "tr",
    title: "Yazi",
    content: "Icerik",
    excerpt: "Ozet",
  });

  expect(api.post).toHaveBeenCalledWith("/blog/post-1/translations", expect.any(Object));
});
~~~

- [ ] Run the test first and observe the missing-method failure:

~~~powershell
cd portfolio-project/frontend
npm run test -- --run src/services/blogService.test.ts
~~~

- [ ] Implement methods and rerun the focused test.
- [ ] Commit:

~~~powershell
git add portfolio-project/frontend/src/services/api.ts portfolio-project/frontend/src/services/types.ts portfolio-project/frontend/src/services/blogService.ts portfolio-project/frontend/src/services/blogService.test.ts
git commit -m "feat(frontend): expose admin blog service contract"
~~~

### Task 1.6: Build NEXUS Blog admin components

**Files:**

- Create: portfolio-project/frontend/src/components/admin/BlogForms.tsx
- Create: portfolio-project/frontend/src/components/admin/tabs/BlogTab.tsx
- Modify: portfolio-project/frontend/src/components/admin/types.ts
- Modify: portfolio-project/frontend/src/components/admin/tabs/index.ts
- Modify: portfolio-project/frontend/src/components/admin/tabs/AdminTabs.test.tsx

**Interfaces:**

- BlogFormValues contains title, slug, excerpt, content, coverImage, tags, readingTime, and published.
- BlogForm accepts initialValues, mode, loading, language, onSubmit, and onCancel.
- BlogTranslationEditor accepts EN/TR form state, onSave(language, values), loading, and language.
- BlogTab accepts list state and row callbacks; it does not call the API.
- AdminTabId gains blog; AdminCopy gains Blog labels and form copy.

- [ ] Add a failing tab test covering title, Draft status, create, edit, delete, and translation callbacks.
- [ ] Run the test and observe missing component/type failures:

~~~powershell
cd portfolio-project/frontend
npm run test -- --run src/components/admin/tabs/AdminTabs.test.tsx
~~~

- [ ] Implement BlogTab with the ProjectsTab loading/empty/confirmation patterns and NEXUS panel, sys-label, border-dark-600, text-primary-400, and status-dot classes.
- [ ] Implement BlogForm with required title/content, create-only slug, optional excerpt/cover image, comma-separated tags, numeric reading time, and published checkbox.
- [ ] Implement BlogTranslationEditor with EN/TR tabs and title/content/excerpt fields.
- [ ] Rerun AdminTabs.test.tsx; expected result is all tab tests passing.
- [ ] Commit:

~~~powershell
git add portfolio-project/frontend/src/components/admin/BlogForms.tsx portfolio-project/frontend/src/components/admin/tabs/BlogTab.tsx portfolio-project/frontend/src/components/admin/types.ts portfolio-project/frontend/src/components/admin/tabs/index.ts portfolio-project/frontend/src/components/admin/tabs/AdminTabs.test.tsx
git commit -m "feat(admin): add Nexus blog management components"
~~~

### Task 1.7: Integrate Blog CRUD into Admin.tsx

**Files:**

- Modify: portfolio-project/frontend/src/routes/Admin.tsx
- Modify: portfolio-project/frontend/src/components/admin/types.ts

**Interfaces:**

- loadBlogPosts(): Promise<void> calls blogService.getAdminPosts().
- handleBlogSubmit(values): Promise<void> calls createPost or updatePost and refreshes the list.
- openBlogTranslationModal(post): Promise<void> loads getAdminPost(post.id).
- handleBlogTranslationSave(language, values): Promise<void> calls addTranslation.

- [ ] Add Blog state, refs, and modal state next to existing domain state without reformatting unrelated code.
- [ ] Add service/component imports and EN/TR admin copy.
- [ ] Add Blog to the tab array and render BlogTab when activeTab is blog.
- [ ] Load Blog posts lazily when the Blog tab is selected.
- [ ] On create, send trimmed fields, a de-duplicated comma-separated tags array, optional reading_time, and published state.
- [ ] On edit, omit slug.
- [ ] Reuse handleApiError, showToast, focus-trap refs, and existing modal lifecycle patterns.
- [ ] Confirm delete and disable the matching row action while pending.
- [ ] Run:

~~~powershell
cd portfolio-project/frontend
npm run test -- --run src/components/admin/tabs/AdminTabs.test.tsx src/services/blogService.test.ts
npm run type-check
~~~

Expected: focused tests and type-check pass.

- [ ] Commit:

~~~powershell
git add portfolio-project/frontend/src/routes/Admin.tsx portfolio-project/frontend/src/components/admin/types.ts
git commit -m "feat(admin): connect Blog CRUD to control panel"
~~~

### Task 1.8: Make public Blog reads fresh and view counting explicit

**Files:**

- Modify: portfolio-project/frontend/src/lib/blog.ts
- Modify: portfolio-project/frontend/src/lib/blog.test.ts
- Modify: portfolio-project/frontend/src/test/public-routes.ssr.test.tsx if Blog SSR coverage is extended

**Interfaces:**

- fetchBlogPosts(locale) returns current published data without a five-minute ISR delay.
- fetchBlogPostMetadata(slug, locale) requests count_view=false.
- fetchBlogPostBundle(slug, locale) requests count_view=true once.
- BlogPostBundle statuses remain ok, not_found, and unavailable.

- [ ] Add a failing fetch test asserting count_view=false and cache no-store:

~~~typescript
it("does not increment views while generating metadata", async () => {
  vi.spyOn(global, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify({ id: "post-1", slug: "post", title: "Post" }), { status: 200 }),
  );

  await fetchBlogPostMetadata("post", "en");

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining("count_view=false"),
    expect.objectContaining({ cache: "no-store" }),
  );
});
~~~

- [ ] Replace next revalidate options with cache no-store for Blog requests.
- [ ] Add count_view=false to metadata URLs and count_view=true to detail URLs.
- [ ] Preserve timeout, degraded, related, and latest behavior.
- [ ] Run:

~~~powershell
cd portfolio-project/frontend
npm run test -- --run src/lib/blog.test.ts src/test/public-routes.ssr.test.tsx
~~~

- [ ] Commit:

~~~powershell
git add portfolio-project/frontend/src/lib/blog.ts portfolio-project/frontend/src/lib/blog.test.ts portfolio-project/frontend/src/test/public-routes.ssr.test.tsx
git commit -m "fix(blog): keep public content fresh and view counts stable"
~~~

### Task 1.9: Verify the complete Blog phase

- [ ] Run backend:

~~~powershell
cd portfolio-project
python -m pytest backend/tests/test_blog.py backend/tests/test_admin_security.py -q
~~~

- [ ] Run frontend:

~~~powershell
cd frontend
npm run test -- --run src/services/blogService.test.ts src/lib/blog.test.ts src/components/admin/tabs/AdminTabs.test.tsx src/test/public-routes.ssr.test.tsx
npm run lint
npm run type-check
npm run build
~~~

- [ ] Run the quality gate from portfolio-project:

~~~powershell
./quality.ps1
~~~

- [ ] Verify acceptance manually: create draft, confirm it is absent publicly, edit tags and EN/TR, publish, see it immediately, open Markdown detail, confirm one view increment, delete, and confirm removal.
- [ ] Inspect git status and ensure layout.tsx and next-env.d.ts remain untouched.

---

## Phase 2: Technologies and project index

### Task 2.1: Normalize Technology administration

**Files:**

- Inspect/modify: portfolio-project/backend/app/api/v1/technologies.py
- Read: portfolio-project/backend/app/models/technology.py
- Inspect/modify: portfolio-project/backend/app/schemas/technology.py
- Inspect/modify: portfolio-project/frontend/src/services/technologyService.ts
- Create: portfolio-project/frontend/src/components/admin/tabs/TechnologiesTab.tsx
- Modify: portfolio-project/frontend/src/routes/Admin.tsx
- Test: portfolio-project/backend/tests/test_technologies.py and frontend AdminTabs tests

- [ ] Test list/create/update/delete authorization and unique slug behavior first.
- [ ] Add the Technologies tab with name, slug, icon, color, category, edit, delete, loading, and empty states.
- [ ] Make ProjectForm consume the same technology catalog and refresh after mutations.
- [ ] Regenerate OpenAPI/types if the contract changes.
- [ ] Acceptance: a technology created in admin is selectable and persists on a project.

### Task 2.2: Replace static project index fields

**Files:**

- Modify: portfolio-project/frontend/src/routes/Projects.tsx
- Modify: portfolio-project/frontend/src/routes/ProjectsClient.tsx if hydration requires it
- Modify: portfolio-project/frontend/src/services/projectService.ts
- Modify: portfolio-project/frontend/src/test/public-routes.ssr.test.tsx
- Retain until Phase 4: portfolio-project/frontend/src/content/projectDetails.ts
- Retire after acceptance: project records in portfolio-project/frontend/src/content/site.ts

- [ ] Test API title, summary, description, impact, technologies, featured state, and display order.
- [ ] Transform API projects into the existing ProjectIndex/DossierProject input shape with details undefined until Phase 4.
- [ ] Preserve locale fallback and no-project states.
- [ ] Acceptance: an admin project edit changes the public index after a fresh request.

---

## Phase 3: Skills, CapabilityMatrix, and TechRadar

### Task 3.1: Define skill transformations

**Files:**

- Create: portfolio-project/frontend/src/lib/skills.ts
- Modify: portfolio-project/frontend/src/components/nexus/CapabilityMatrix.tsx
- Modify: portfolio-project/frontend/src/components/nexus/TechRadar.tsx
- Modify: portfolio-project/frontend/src/routes/About.tsx
- Test: portfolio-project/frontend/src/lib/skills.test.ts and public SSR tests

- [ ] Test grouping by domain, order_index sorting, and ring mapping.
- [ ] Implement toCapabilityGroups(skills, locale) returning CapabilityGroup.
- [ ] Replace TechRadar's static blips with a typed input.
- [ ] Preserve four quadrant layout through an explicit quadrant field or deterministic category mapping.
- [ ] Acceptance: an admin-created skill appears in its domain group and radar ring.

### Task 3.2: Wire live skills into About

**Files:**

- Modify: portfolio-project/frontend/src/routes/About.tsx
- Modify: portfolio-project/frontend/src/lib/skills.ts
- Modify: portfolio-project/frontend/src/hooks/usePublicData.ts only if client fetching is selected
- Test: portfolio-project/frontend/src/test/public-routes.ssr.test.tsx

- [ ] Add loading, error, and empty states.
- [ ] Use skillService.getSkills(language) and the existing query key when client fetching is selected.
- [ ] Acceptance: About has no API-independent capability/radar item list.

---

## Phase 4: Project dossier persistence and editor

### Task 4.1: Create the typed dossier aggregate

**Files:**

- Create: portfolio-project/backend/app/models/dossier.py
- Create: portfolio-project/backend/app/schemas/dossier.py
- Create: portfolio-project/backend/app/crud/dossier.py
- Create: portfolio-project/backend/app/api/v1/dossiers.py
- Create: portfolio-project/backend/alembic/versions/20260713_0005_project_dossier.py
- Modify: portfolio-project/backend/app/models/__init__.py and api/v1/__init__.py
- Test: portfolio-project/backend/tests/test_dossiers.py

- [ ] Model one-to-one ProjectDossier and ordered child tables for metrics, C4 nodes, ADRs, log entries, diagrams, and gallery items.
- [ ] Add cascade foreign keys and display_order columns.
- [ ] Validate labels, URLs, C4 levels, and non-negative metric values.
- [ ] Add public reads and admin-only mutations.
- [ ] Acceptance: the aggregate can be created, updated atomically, read by project slug, and deleted with its project.

### Task 4.2: Add dossier editing to Projects admin

**Files:**

- Create: portfolio-project/frontend/src/components/admin/DossierForms.tsx
- Create: portfolio-project/frontend/src/components/admin/DossierEditor.tsx
- Modify: portfolio-project/frontend/src/routes/Admin.tsx
- Modify: portfolio-project/frontend/src/components/admin/tabs/ProjectsTab.tsx
- Test: portfolio-project/frontend/src/components/admin/DossierEditor.test.tsx

- [ ] Add overview, metrics, C4, ADR, engineering log, diagrams, and gallery tabs.
- [ ] Submit one validated aggregate payload.
- [ ] Preserve existing image-manager behavior until gallery replacement is accepted.
- [ ] Acceptance: admin-authored dossier renders in the public project modal.

### Task 4.3: Replace static dossier reads

**Files:**

- Modify: portfolio-project/frontend/src/routes/Projects.tsx
- Modify: portfolio-project/frontend/src/components/nexus/ProjectDossierModal.tsx
- Modify: portfolio-project/frontend/src/components/nexus/ProjectIndex.tsx
- Retire after acceptance: portfolio-project/frontend/src/content/projectDetails.ts
- Test: portfolio-project/frontend/src/components/nexus/dossier.test.tsx

- [ ] Test API dossier to DossierProject transformation first.
- [ ] Implement transformation and degraded/empty dossier state.
- [ ] Acceptance: public code no longer imports projectDetails.ts.

---

## Phase 5: Experience-backed career graph

### Task 5.1: Extend Experience for graph presentation

**Files:**

- Modify: portfolio-project/backend/app/models/experience.py
- Modify: portfolio-project/backend/app/schemas/experience.py
- Modify: portfolio-project/backend/app/crud/experience.py
- Modify: portfolio-project/backend/app/api/v1/experiences.py
- Create: portfolio-project/backend/alembic/versions/20260713_0006_experience_graph_fields.py
- Test: portfolio-project/backend/tests/test_experiences.py

- [ ] Add lane id/label/color, timeline position, node kind, and optional link target.
- [ ] Validate timeline positions from 0 to 100 and node kind start, normal, or head.
- [ ] Preserve existing experience list and translations.
- [ ] Acceptance: existing Experience CRUD stores all data needed for the current graph.

### Task 5.2: Transform live experiences into CareerGraph

**Files:**

- Create: portfolio-project/frontend/src/lib/career.ts
- Modify: portfolio-project/frontend/src/components/nexus/CareerViews.tsx
- Modify: portfolio-project/frontend/src/routes/About.tsx
- Test: portfolio-project/frontend/src/lib/career.test.ts

- [ ] Test lane grouping, node ordering, translated labels, and explicit links.
- [ ] Implement toCareerGraph(experiences, locale) returning lanes, nodes, and links.
- [ ] Add API loading and degraded states.
- [ ] Acceptance: both graph and log views update after one Experience edit and public code no longer imports careerGraph.ts.

---

## Phase 6: Translations and site configuration

### Task 6.1: Build protected translation administration

**Files:**

- Modify: portfolio-project/backend/app/api/v1/translations.py and schemas
- Modify: portfolio-project/frontend/src/services/api.ts
- Create: portfolio-project/frontend/src/components/admin/tabs/TranslationsTab.tsx
- Modify: portfolio-project/frontend/src/routes/Admin.tsx
- Test: backend translation tests and frontend AdminTabs tests

- [ ] Test admin-only list/upsert behavior first.
- [ ] Add key, EN, and TR editing, search, and duplicate-key validation.
- [ ] Acceptance: an edited dictionary value is returned by the public locale loader.

### Task 6.2: Build site-config administration

**Files:**

- Modify: portfolio-project/backend/app/api/v1/site.py, crud/site.py, and schemas/site.py
- Create: portfolio-project/frontend/src/components/admin/tabs/SiteConfigTab.tsx
- Modify: portfolio-project/frontend/src/routes/Admin.tsx
- Modify: portfolio-project/frontend/src/lib/metadata.ts and frontend/app/layout.tsx
- Test: backend site tests and frontend metadata tests

- [ ] Protect mutations and validate URLs, email, and social handles.
- [ ] Add fallback to checked-in config when API is unavailable.
- [ ] Keep metadata generation deterministic and avoid admin-only requests from public rendering.
- [ ] Acceptance: social links, availability status, and metadata update from admin config.

---

## Final cross-cutting cleanup

### Task C.1: Retire dead data paths

- [ ] Remove each static entity only after its API-backed acceptance test passes.
- [ ] Remove unused hooks only after rg confirms no consumer remains.
- [ ] Keep telemetry static/read-only unless separately approved.

### Task C.2: Complete NEXUS admin consistency

**Files:**

- Modify: portfolio-project/frontend/src/components/admin/AdminForms.tsx
- Modify: touched portfolio-project/frontend/src/components/admin/tabs files
- Test: portfolio-project/frontend/src/components/admin/tabs/AdminTabs.test.tsx

- [ ] Replace remaining plain modal surfaces with NEXUS panel/border treatment as tabs are touched.
- [ ] Use cyan status dots and preserve keyboard focus traps.
- [ ] Keep copy localized through the existing EN/TR admin copy pattern.

### Task C.3: Final verification

- [ ] Run ./quality.ps1 from portfolio-project.
- [ ] Run git diff --check.
- [ ] Confirm generated files are clean with npm run check:api-types.
- [ ] Confirm layout.tsx and next-env.d.ts remain untouched unless explicitly requested.
- [ ] Use superpowers:finishing-a-development-branch after all intended phases are verified.
