# Project Dossier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist project dossiers in a validated backend aggregate, expose public/admin APIs, add the NEXUS admin editor, and render public dossiers without the static `projectDetails.ts` dependency.

**Architecture:** A `ProjectDossier` one-to-one root owns ordered relational child tables for metrics, C4 levels/nodes, ADRs, log entries, diagrams, and gallery items. The admin saves a complete aggregate with one atomic PUT; heterogeneous diagram data is stored as validated variant JSON. The public project page loads a dossier by slug and degrades to a compact modal when no dossier exists.

**Tech Stack:** FastAPI, SQLAlchemy 2, Pydantic v2, Alembic, pytest, Next.js App Router, React 19, TypeScript, Axios, TanStack Query, Vitest, Testing Library.

## Global Constraints

- Work on `feature/frontend-yosys-dossier`; never commit directly to `main`.
- Preserve the existing user modifications in `portfolio-project/frontend/app/layout.tsx` and `portfolio-project/frontend/next-env.d.ts`; never stage either file.
- Every backend model/schema change includes migration, OpenAPI export, and generated frontend API types.
- Every behavior change follows red-green-refactor: write a failing test, observe the expected failure, implement the smallest change, then rerun focused and regression tests.
- Public dossier reads are unauthenticated; all dossier mutations and admin reads use `require_admin`.
- Dossier child collections are typed and ordered; only per-diagram heterogeneous data may use validated JSON.
- Whole-aggregate updates are transactional and replace all submitted child collections.
- Dossier gallery items do not replace the existing `ProjectImage` image manager.
- EN/TR are the first admin UI languages; dossier impact stores `impact_en` and `impact_tr`, while technical dossier fields remain EN-first.
- Commit each meaningful unit with an English Conventional Commit message.
- Do not remove `projectDetails.ts` until API-backed public rendering and its tests pass.

---

## File map

### Backend

- Create `portfolio-project/backend/app/models/dossier.py`: root and ordered child ORM models.
- Create `portfolio-project/backend/app/schemas/dossier.py`: request/response models, diagram variants, validators.
- Create `portfolio-project/backend/app/crud/dossier.py`: ordered loading and atomic aggregate replacement.
- Create `portfolio-project/backend/app/api/v1/dossiers.py`: public read and protected admin endpoints.
- Create `portfolio-project/backend/alembic/versions/20260713_0005_project_dossier.py`: schema migration.
- Modify `portfolio-project/backend/app/models/__init__.py` and `app/api/v1/__init__.py`.
- Create `portfolio-project/backend/tests/test_dossiers.py`.
- Regenerate `portfolio-project/backend/openapi.json` through the export script only.

### Frontend API and transformation

- Create `frontend/src/services/dossierService.ts` and its test.
- Modify `frontend/src/services/api.ts`, `types.ts`, and generated API types.
- Create `frontend/src/lib/dossier.ts` and its test.
- Modify the three NEXUS dossier renderers and their test fixture.

### Public and admin UI

- Modify `frontend/src/hooks/usePublicData.ts`, `routes/Projects.tsx`, and `lib/projects.ts`.
- Create `frontend/src/routes/Projects.test.tsx` for selected-project loading and degraded state.
- Create `frontend/src/components/admin/DossierEditor.tsx` and its test.
- Modify admin types, project tab, tab index, and `routes/Admin.tsx`.
- Delete `frontend/src/content/projectDetails.ts` only after the import audit passes.

## API contract

The backend response uses these exact collection names:

```python
class ProjectDossierResponse(BaseModel):
    id: UUID
    project_id: UUID
    project_slug: str
    impact: str
    impact_en: str | None = None       # admin response only
    impact_tr: str | None = None       # admin response only
    metrics: list[DossierMetricResponse]
    c4: list[DossierC4LevelResponse]
    adrs: list[DossierAdrResponse]
    log: list[DossierLogEntryResponse]
    diagrams: list[DossierDiagramResponse]
    gallery: list[DossierGalleryItemResponse]


class ProjectDossierUpsert(BaseModel):
    impact_en: str = Field(..., min_length=1, max_length=10_000)
    impact_tr: str = Field(..., min_length=1, max_length=10_000)
    metrics: list[DossierMetricCreate] = Field(default_factory=list, max_length=20)
    c4: list[DossierC4LevelCreate] = Field(default_factory=list, max_length=8)
    adrs: list[DossierAdrCreate] = Field(default_factory=list, max_length=50)
    log: list[DossierLogEntryCreate] = Field(default_factory=list, max_length=100)
    diagrams: list[DossierDiagramCreate] = Field(default_factory=list, max_length=30)
    gallery: list[DossierGalleryItemCreate] = Field(default_factory=list, max_length=50)
```

Routes:

- `GET /api/v1/dossiers/{project_slug}?language=en|tr` — public read.
- `GET /api/v1/dossiers/projects/{project_id}` — admin read with both impact values.
- `PUT /api/v1/dossiers/projects/{project_id}` — admin atomic whole-aggregate upsert.
- `DELETE /api/v1/dossiers/projects/{project_id}` — admin delete.

## Tasks

### Task 1: Add typed backend models and schema validation

**Files:**

- Create: `portfolio-project/backend/app/models/dossier.py`
- Create: `portfolio-project/backend/app/schemas/dossier.py`
- Modify: `portfolio-project/backend/app/models/__init__.py`
- Test: `portfolio-project/backend/tests/test_dossiers.py`

**Interfaces:**

- `ProjectDossier` owns `metrics`, `c4_levels`, `adrs`, `log_entries`, `diagrams`, and `gallery_items`.
- C4 levels own ordered `c4_nodes`.
- Schemas expose `c4`, `log`, and `gallery` aliases at the API boundary.

- [x] **Step 1: Write failing schema tests.**

```python
from decimal import Decimal
from pydantic import ValidationError
import pytest
from app.schemas.dossier import ProjectDossierUpsert


def valid_dossier_payload() -> dict:
    return {
        "impact_en": "Built a reliable scheduling workflow.",
        "impact_tr": "Guvenilir bir planlama akisi kurdum.",
        "metrics": [{"value": "86.97%", "numeric_value": "86.97", "label": "coverage", "display_order": 0}],
        "c4": [{"label": "Context", "tiers": [[{"kind": "person", "title": "Student", "tier_order": 0}]], "display_order": 0}],
        "adrs": [],
        "log": [],
        "diagrams": [{"id": "flow", "kind": "tiers", "title": "Delivery flow", "data": {"tiers": [[{"kind": "start", "title": "start"}]]}, "display_order": 0}],
        "gallery": [{"id": "shot-1", "src": "/projects/shot.png", "caption": "fig 01", "display_order": 0}],
    }


def test_dossier_payload_accepts_typed_variants():
    payload = ProjectDossierUpsert.model_validate(valid_dossier_payload())
    assert payload.metrics[0].numeric_value == Decimal("86.97")
    assert payload.c4[0].tiers[0][0].kind == "person"
    assert payload.diagrams[0].kind == "tiers"


@pytest.mark.parametrize("field,value", [
    ("gallery", [{"id": "x", "src": "javascript:alert(1)", "caption": "x"}]),
    ("metrics", [{"value": "-1", "numeric_value": "-1", "label": "bad"}]),
    ("c4", [{"label": "Context", "tiers": [[{"kind": "unknown", "title": "x"}]]}]),
])
def test_dossier_payload_rejects_invalid_children(field, value):
    data = valid_dossier_payload()
    data[field] = value
    with pytest.raises(ValidationError):
        ProjectDossierUpsert.model_validate(data)


def test_dossier_payload_rejects_duplicate_diagram_ids():
    data = valid_dossier_payload()
    data["diagrams"] = [
        {"id": "same", "kind": "tiers", "title": "one", "data": {"tiers": []}},
        {"id": "same", "kind": "tiers", "title": "two", "data": {"tiers": []}},
    ]
    with pytest.raises(ValidationError):
        ProjectDossierUpsert.model_validate(data)
```

- [x] **Step 2: Run the focused test and verify the red state.**

```powershell
cd portfolio-project
python -m pytest backend/tests/test_dossiers.py -q --no-cov
```

Expected: collection/import failure because the dossier schema does not exist.

- [x] **Step 3: Implement ORM models and Pydantic schemas.**

Use UUID primary keys and the existing `Base` style. Define a unique
`project_id` foreign key on `ProjectDossier`; child foreign keys use
`ondelete="CASCADE"`, and relationships use `cascade="all, delete-orphan"`
with order clauses. Use `Numeric(18, 4)` for optional metric
`numeric_value`, `JSON` for validated diagram data, and bounded String/Text
columns for the contract.

Define diagram variants `C4DiagramData`, `SequenceDiagramData`,
`SchemaDiagramData`, `TiersDiagramData`, and `MatrixDiagramData` with
`Annotated[Union[...], Field(discriminator="kind")]`. Validate non-empty
labels/text, non-negative orders and numeric values, allowed C4/diagram/flow
kinds, duplicate child ids, and gallery sources beginning with `/` or using
`http(s)`.

- [x] **Step 4: Run schema tests and model import checks.**

```powershell
python -m pytest backend/tests/test_dossiers.py -q --no-cov
python -m compileall backend/app/models/dossier.py backend/app/schemas/dossier.py
```

Expected: schema tests pass.

- [x] **Step 5: Commit the typed contract.**

```powershell
git add backend/app/models/dossier.py backend/app/schemas/dossier.py backend/app/models/__init__.py backend/tests/test_dossiers.py
git commit -m "feat(backend): add typed project dossier contract"
```

### Task 2: Create the dossier migration

**Files:**

- Create: `portfolio-project/backend/alembic/versions/20260713_0005_project_dossier.py`
- Modify: `portfolio-project/backend/tests/test_dossiers.py`

**Interfaces:**

- Revision is `20260713_0005`; down revision is `20260713_0004`.
- Downgrade drops child tables first, then `project_dossiers`.

- [x] **Step 1: Add a migration revision test.**

```python
def test_dossier_migration_revision():
    from pathlib import Path
    migration = Path("backend/alembic/versions/20260713_0005_project_dossier.py")
    assert migration.exists()
    source = migration.read_text(encoding="utf-8")
    assert 'revision: str = "20260713_0005"' in source
    assert 'down_revision: Union[str, None] = "20260713_0004"' in source
```

- [x] **Step 2: Run the test and observe the red state.**

```powershell
python -m pytest backend/tests/test_dossiers.py::test_dossier_migration_revision -q --no-cov
```

Expected: FAIL because the migration file does not exist yet.

- [x] **Step 3: Add the Alembic revision.**

Create all eight tables with UUID keys, unique root ownership, child indexes,
non-negative order defaults, `sa.Numeric(18, 4)` metric values,
`sa.JSON()` diagram data, and cascade foreign keys. Keep existing project and
project-image tables untouched.

- [x] **Step 4: Run offline migration checks.**

```powershell
python -m compileall backend/alembic/versions/20260713_0005_project_dossier.py
python -m alembic upgrade 20260713_0005 --sql > $env:TEMP\dossier-migration.sql
Select-String -Path $env:TEMP\dossier-migration.sql -Pattern "project_dossiers|dossier_gallery_items|CASCADE"
```

Expected: revision compiles and offline SQL contains all tables and cascades.

- [x] **Step 5: Commit the migration.**

```powershell
git add backend/alembic/versions/20260713_0005_project_dossier.py
git commit -m "feat(backend): add project dossier migration"
```

### Task 3: Implement atomic CRUD and the protected/public API

**Files:**

- Create: `portfolio-project/backend/app/crud/dossier.py`
- Create: `portfolio-project/backend/app/api/v1/dossiers.py`
- Modify: `portfolio-project/backend/app/api/v1/__init__.py`
- Modify: `portfolio-project/backend/tests/test_dossiers.py`

**Interfaces:**

- `get_dossier_by_project_slug(db, slug, language="en") -> ProjectDossierResponse | None`
- `get_dossier_by_project_id(db, project_id) -> ProjectDossierResponse | None`
- `upsert_dossier(db, project_id, payload) -> ProjectDossierResponse`
- `delete_dossier(db, project_id) -> bool`

- [x] **Step 1: Write failing route and transaction tests.**

```python
def test_dossier_public_read_is_ordered(client, create_project, admin_headers):
    project = create_project(slug="dossier-project")
    response = client.put(f"/api/v1/dossiers/projects/{project.id}", headers=admin_headers, json=valid_dossier_payload())
    assert response.status_code == 200
    public = client.get("/api/v1/dossiers/dossier-project?language=en")
    assert public.status_code == 200
    assert public.json()["impact"] == "Built a reliable scheduling workflow."
    assert public.json()["metrics"][0]["label"] == "coverage"


def test_dossier_mutations_are_admin_only(client, create_project, user_headers):
    project = create_project(slug="protected-dossier")
    response = client.put(f"/api/v1/dossiers/projects/{project.id}", headers=user_headers, json=valid_dossier_payload())
    assert response.status_code == 403


def test_invalid_replace_keeps_previous_aggregate(client, create_project, admin_headers):
    project = create_project(slug="atomic-dossier")
    assert client.put(f"/api/v1/dossiers/projects/{project.id}", headers=admin_headers, json=valid_dossier_payload()).status_code == 200
    invalid = valid_dossier_payload()
    invalid["gallery"] = [{"id": "x", "src": "javascript:bad", "caption": "x"}]
    rejected = client.put(f"/api/v1/dossiers/projects/{project.id}", headers=admin_headers, json=invalid)
    assert rejected.status_code == 422
    unchanged = client.get("/api/v1/dossiers/atomic-dossier")
    assert unchanged.json()["metrics"][0]["label"] == "coverage"


def test_project_delete_cascades_dossier(client, create_project, admin_headers):
    project = create_project(slug="cascade-dossier")
    assert client.put(f"/api/v1/dossiers/projects/{project.id}", headers=admin_headers, json=valid_dossier_payload()).status_code == 200
    assert client.delete(f"/api/v1/projects/{project.id}", headers=admin_headers).status_code == 204
    assert client.get("/api/v1/dossiers/cascade-dossier").status_code == 404
```

- [x] **Step 2: Run focused tests and verify the red state.**

```powershell
python -m pytest backend/tests/test_dossiers.py -q --no-cov
```

Expected: FAIL because CRUD and router functions are absent.

- [x] **Step 3: Implement ordered serializer and atomic CRUD.**

Load every child with `joinedload`, serialize to the public/admin response,
and sort by the declared order. In `upsert_dossier`, find the project,
create/reuse the root, assign impact values, remove old children through
relationships, insert validated rows in request order, flush, commit, reload,
and return. Roll back and re-raise on every exception; child helpers must not
commit independently.

- [x] **Step 4: Implement router and audit actions.**

Mount `dossiers.router` at `/dossiers`. Public GET uses
`Query("en", pattern="^(tr|en)$")`; admin GET/PUT/DELETE use
`require_admin`. Map missing project/dossier to 404 and record
`project_dossier.create/update/delete` through `record_admin_action`.

- [x] **Step 5: Run focused and regression backend tests.**

```powershell
python -m pytest backend/tests/test_dossiers.py -q --no-cov
python -m pytest backend/tests/test_projects_admin.py backend/tests/test_admin_audit.py -q --no-cov
```

Expected: all focused dossier, project, and audit tests pass.

- [x] **Step 6: Commit the backend API.**

```powershell
git add backend/app/crud/dossier.py backend/app/api/v1/dossiers.py backend/app/api/v1/__init__.py backend/tests/test_dossiers.py
git commit -m "feat(backend): expose project dossier API"
```

### Task 4: Export the contract and add the frontend dossier service

**Files:**

- Modify generated: `portfolio-project/backend/openapi.json`
- Modify generated: `portfolio-project/frontend/src/services/apiTypes.generated.ts`
- Modify: `frontend/src/services/api.ts`
- Create: `frontend/src/services/dossierService.ts`
- Modify: `frontend/src/services/types.ts`
- Create: `frontend/src/services/dossierService.test.ts`

**Interfaces:**

- `apiEndpoints.dossiers.public(slug)` is `/dossiers/{slug}`.
- `apiEndpoints.dossiers.admin(projectId)` is `/dossiers/projects/{projectId}`.
- `dossierService.getPublicDossier(slug, language?)`, `getAdminDossier(projectId)`, `upsertDossier(projectId, payload)`, and `deleteDossier(projectId)`.

- [x] **Step 1: Export OpenAPI and write failing service tests.**

```powershell
cd portfolio-project
python backend/scripts/export_openapi.py --output backend/openapi.json
cd frontend
npm run gen:api
```

```typescript
it("loads a public dossier by slug and language", async () => {
  vi.spyOn(api, "get").mockResolvedValueOnce({ data: { project_slug: "demo", impact: "impact", metrics: [] } });
  await dossierService.getPublicDossier("demo", "tr");
  expect(api.get).toHaveBeenCalledWith("/dossiers/demo", { params: { language: "tr" } });
});

it("saves one complete admin payload", async () => {
  vi.spyOn(api, "put").mockResolvedValueOnce({ data: { project_id: "p1" } });
  await dossierService.upsertDossier("p1", { impact_en: "en", impact_tr: "tr", metrics: [], c4: [], adrs: [], log: [], diagrams: [], gallery: [] });
  expect(api.put).toHaveBeenCalledWith("/dossiers/projects/p1", expect.any(Object));
});
```

Expected initial focused run: FAIL because endpoint mappings and service methods are absent.

- [x] **Step 2: Implement typed endpoints and service.**

Add API-derived dossier interfaces, preserve existing `Project` compatibility,
pass `{ params: { language } }` only when supplied, and send the complete PUT
payload unchanged.

- [x] **Step 3: Regenerate and check API types.**

```powershell
npm run gen:api
npm run check:api-types
npm run test -- --run src/services/dossierService.test.ts
```

Expected: generated files are stable and focused service tests pass.

- [x] **Step 4: Commit the service boundary.**

```powershell
git add ../backend/openapi.json src/services/apiTypes.generated.ts src/services/api.ts src/services/types.ts src/services/dossierService.ts src/services/dossierService.test.ts
git commit -m "feat(frontend): add project dossier service contract"
```

### Task 5: Move renderer types and add the API transformation

**Files:**

- Create: `frontend/src/lib/dossier.ts`
- Create: `frontend/src/lib/dossier.test.ts`
- Modify: `frontend/src/components/nexus/ProjectDossierModal.tsx`
- Modify: `frontend/src/components/nexus/C4Diagram.tsx`
- Modify: `frontend/src/components/nexus/DiagramGallery.tsx`
- Modify: `frontend/src/components/nexus/dossier.test.tsx`

**Interfaces:**

- `toDossierProject(project: Project, dossier: ProjectDossier | null, locale: Locale): DossierProject` is pure.
- `DossierProject.details` is optional and no renderer imports `content/projectDetails`.

- [x] **Step 1: Write failing mapper tests.**

```typescript
it("maps an API dossier into ordered renderer data", () => {
  const result = toDossierProject(project, dossier, "tr");
  expect(result.impact).toBe("Guvenilir akis");
  expect(result.details?.metrics[0].label).toBe("coverage");
  expect(result.details?.c4[0].tiers[0][0].kind).toBe("person");
  expect(result.details?.gallery[0].src).toBe("/projects/demo.png");
});

it("returns a compact project when dossier is absent", () => {
  expect(toDossierProject(project, null, "en").details).toBeUndefined();
});
```

- [x] **Step 2: Run focused test and verify the red state.**

```powershell
cd portfolio-project/frontend
npm run test -- --run src/lib/dossier.test.ts
```

Expected: FAIL because mapper and neutral types do not exist.

- [x] **Step 3: Move structural types and implement mapper.**

Move C4, diagram, metric, ADR, log, and gallery types from
`content/projectDetails.ts` to `lib/dossier.ts`. Convert snake_case API
fields, sort every child collection, and prepend the C4 diagram when levels
exist. Use API impact with EN fallback and `""` when there is no dossier.

- [x] **Step 4: Update renderer imports and local fixtures.**

Replace static type imports with `@/lib/dossier`. Build dossier fixtures
locally from neutral types and retain coverage for modal tabs, C4 zoom, and
diagram rendering.

- [x] **Step 5: Run focused tests and commit.**

```powershell
npm run test -- --run src/lib/dossier.test.ts src/components/nexus/dossier.test.tsx
npm run type-check
git add src/lib/dossier.ts src/lib/dossier.test.ts src/components/nexus/ProjectDossierModal.tsx src/components/nexus/C4Diagram.tsx src/components/nexus/DiagramGallery.tsx src/components/nexus/dossier.test.tsx
git commit -m "refactor(frontend): align dossier renderers with API types"
```

### Task 6: Wire public dossier loading and degraded state

**Files:**

- Modify: `frontend/src/hooks/usePublicData.ts`
- Modify: `frontend/src/routes/Projects.tsx`
- Modify: `frontend/src/lib/projects.ts`
- Modify: `frontend/src/components/nexus/ProjectDossierModal.tsx`
- Modify: public dossier tests

**Interfaces:**

- `useProjectDossierQuery(slug: string | null, language: Locale)` is disabled for null and retries once.
- `mapProjectsToDossierProjects` maps only project API data and leaves `details` undefined.
- Modal props include optional dossier loading/error/retry state.

- [x] **Step 1: Write failing public wiring tests.**

```typescript
it("does not import static dossier data in the public project mapper", () => {
  expect(projectMapperSource).not.toContain("projectDetails");
  expect(projectMapperSource).not.toContain("projectRecords");
});

it("shows a retry action for a failed dossier request", () => {
  render(<ProjectDossierModal project={project} dossierError onRetryDossier={retry} onClose={close} labels={labels} />);
  expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
});
```

- [x] **Step 2: Run tests and verify the red state.**

```powershell
npm run test -- --run src/lib/dossier.test.ts src/components/nexus/dossier.test.tsx
```

Expected: FAIL because query state and retry props are absent.

- [x] **Step 3: Implement selected-project query lifecycle.**

Use existing TanStack Query conventions. Keep the modal open while the dossier
loads, map the selected project through `toDossierProject`, treat 404 as a
compact empty dossier, and show retry UI for other failures.

- [x] **Step 4: Remove static reads from `lib/projects.ts`.**

Delete `projectDetails` and `projectRecords` lookups. Continue mapping title,
summary, description, technologies, and featured from the projects API; dossier
impact and technical details come only from the dossier query.

- [x] **Step 5: Verify and commit.**

```powershell
npm run test -- --run src/lib/dossier.test.ts src/components/nexus/dossier.test.tsx src/routes/Projects.test.tsx
npm run lint
npm run type-check
git add src/hooks/usePublicData.ts src/routes/Projects.tsx src/lib/projects.ts src/components/nexus/ProjectDossierModal.tsx
git commit -m "feat(frontend): load project dossiers on demand"
```

### Task 7: Build the admin dossier editor

**Files:**

- Create: `frontend/src/components/admin/DossierEditor.tsx`
- Create: `frontend/src/components/admin/DossierEditor.test.tsx`
- Modify: admin types, `tabs/ProjectsTab.tsx`, `tabs/index.ts`, and `routes/Admin.tsx`

**Interfaces:**

- `DossierFormValues` mirrors `ProjectDossierUpsert` in camelCase at the React boundary.
- `DossierEditor` accepts `initialValues`, `loading`, `language`, `onSubmit`, and `onCancel`.
- `ProjectsTab` receives `onOpenDossierManager(project)`.

- [x] **Step 1: Write the failing editor test.**

```typescript
it("edits overview and metrics and submits one aggregate payload", async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<DossierEditor initialValues={emptyDossierFormValues} loading={false} saving={false} onSubmit={onSubmit} onCancel={vi.fn()} />);
  await userEvent.type(screen.getByLabelText(/impact english/i), "Reliable delivery");
  await userEvent.click(screen.getByRole("button", { name: /add metric/i }));
  await userEvent.type(screen.getByLabelText(/metric label 1/i), "coverage");
  await userEvent.click(screen.getByRole("button", { name: /save dossier/i }));
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
    impactEn: "Reliable delivery",
    metrics: [expect.objectContaining({ label: "coverage", displayOrder: 0 })],
    c4: [], adrs: [], log: [], diagrams: [], gallery: [],
  }));
});
```

- [x] **Step 2: Run the test and verify the red state.**

```powershell
cd portfolio-project/frontend
npm run test -- --run src/components/admin/DossierEditor.test.tsx
```

Expected: FAIL because the editor does not exist.

- [x] **Step 3: Implement typed dynamic sections.**

Create tabs for overview, metrics, C4, ADRs, engineering log, diagrams, and
gallery. Add/remove/reorder immutably, assign display order, render controlled
labeled inputs, and show required/unsafe-path validation. Diagram forms offer
the five supported kinds and typed fields; no arbitrary JSON textarea.

- [x] **Step 4: Connect Admin.tsx and preserve image management.**

Add a dossier action to project rows. Load the protected dossier by project id;
on 404 use `emptyDossierFormValues`. Convert camelCase to the snake_case PUT
payload, call `upsertDossier`, close and refresh on success, and route failures
through `handleApiError`. Do not change image-manager behavior.

- [x] **Step 5: Verify and commit.**

```powershell
npm run test -- --run src/components/admin/DossierEditor.test.tsx src/components/admin/tabs/AdminTabs.test.tsx
npm run lint
npm run type-check
git add src/components/admin/DossierEditor.tsx src/components/admin/DossierEditor.test.tsx src/components/admin/types.ts src/components/admin/tabs/ProjectsTab.tsx src/routes/Admin.tsx
git commit -m "feat(frontend): add project dossier editor"
```

### Task 8: Retire static data and complete verification

**Files:**

- Modify dossier tests to use local typed fixtures.
- Delete only after the import audit: `frontend/src/content/projectDetails.ts`.
- Modify `docs/superpowers/plans/2026-07-13-admin-driven-harmony.md`.

**Interfaces:**

- `rg -n "projectDetails|content/projectDetails" portfolio-project/frontend/src` returns no matches.

- [x] **Step 1: Audit static imports.**

```powershell
cd portfolio-project/frontend
rg -n "projectDetails|content/projectDetails" src
```

Expected: only fixtures/type references from earlier tasks remain.

- [x] **Step 2: Replace remaining fixture imports.**

Use local fixtures built from `@/lib/dossier`; do not add a static fallback or
reintroduce `projectRecords` into the public project mapper.

- [x] **Step 3: Delete the static dossier map and verify no matches.**

```powershell
Remove-Item -LiteralPath src/content/projectDetails.ts
rg -n "projectDetails|content/projectDetails" src
```

Expected: no matches.

- [x] **Step 4: Record Phase 4 evidence.**

Update the Phase 4 checklist in
`docs/superpowers/plans/2026-07-13-admin-driven-harmony.md` with commits,
test counts, OpenAPI/type generation, Alembic revision, and static-import audit.
Do not mark later phases complete.

- [x] **Step 5: Run the complete quality gate.**

From `portfolio-project`:

```powershell
python -m pytest -q --no-cov
```

From `portfolio-project/frontend`:

```powershell
npm run test
npm run lint
npm run type-check
npm run check:api-types
npm run build
```

From the repository root:

```powershell
git diff --check
git status --short
```

Expected: all suites pass; any diff-check warning is limited to pre-existing
`layout.tsx` trailing whitespace; neither user file is staged.

- [x] **Step 6: Commit roadmap evidence and use completion skills.**

## Completion note

Phase 4 was implemented on `feature/frontend-yosys-dossier`. The admin editor is
implemented in `DossierEditor.tsx` (the planned `DossierForms.tsx` split was not
needed), and the static dossier map was removed after the source audit passed.

```powershell
git add docs/superpowers/plans/2026-07-13-admin-driven-harmony.md
git commit -m "docs(portfolio): record phase 4 dossier completion"
```

Before claiming completion, run `superpowers:verification-before-completion`
and then `superpowers:finishing-a-development-branch`.
