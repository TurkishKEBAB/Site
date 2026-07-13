"""Project dossier schema and API contract tests."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas.dossier import ProjectDossierUpsert


def valid_dossier_payload() -> dict:
    return {
        "impact_en": "Built a reliable scheduling workflow.",
        "impact_tr": "Guvenilir bir planlama akisi kurdum.",
        "metrics": [
            {
                "value": "86.97%",
                "numeric_value": "86.97",
                "label": "coverage",
                "display_order": 0,
            }
        ],
        "c4": [
            {
                "label": "Context",
                "tiers": [
                    [
                        {
                            "kind": "person",
                            "title": "Student",
                            "tier_order": 0,
                        }
                    ]
                ],
                "display_order": 0,
            }
        ],
        "adrs": [],
        "log": [],
        "diagrams": [
            {
                "id": "flow",
                "kind": "tiers",
                "title": "Delivery flow",
                "data": {
                    "kind": "tiers",
                    "tiers": [[{"kind": "start", "title": "start"}]]
                },
                "display_order": 0,
            }
        ],
        "gallery": [
            {
                "id": "shot-1",
                "src": "/projects/shot.png",
                "caption": "fig 01",
                "display_order": 0,
            }
        ],
    }


def test_dossier_payload_accepts_typed_variants():
    payload = ProjectDossierUpsert.model_validate(valid_dossier_payload())

    assert payload.metrics[0].numeric_value == Decimal("86.97")
    assert payload.c4[0].tiers[0][0].kind == "person"
    assert payload.diagrams[0].kind == "tiers"


@pytest.mark.parametrize(
    "field,value",
    [
        (
            "gallery",
            [{"id": "x", "src": "javascript:alert(1)", "caption": "x"}],
        ),
        (
            "metrics",
            [{"value": "-1", "numeric_value": "-1", "label": "bad"}],
        ),
        (
            "c4",
            [
                {
                    "label": "Context",
                    "tiers": [[{"kind": "unknown", "title": "x"}]],
                }
            ],
        ),
    ],
)
def test_dossier_payload_rejects_invalid_children(field, value):
    data = valid_dossier_payload()
    data[field] = value

    with pytest.raises(ValidationError):
        ProjectDossierUpsert.model_validate(data)


def test_dossier_payload_rejects_duplicate_diagram_ids():
    data = valid_dossier_payload()
    data["diagrams"] = [
        {
            "id": "same",
            "kind": "tiers",
            "title": "one",
            "data": {"kind": "tiers", "tiers": []},
        },
        {
            "id": "same",
            "kind": "tiers",
            "title": "two",
            "data": {"kind": "tiers", "tiers": []},
        },
    ]

    with pytest.raises(ValidationError):
        ProjectDossierUpsert.model_validate(data)


def test_dossier_migration_revision():
    from pathlib import Path

    migration = Path("backend/alembic/versions/20260713_0005_project_dossier.py")
    assert migration.exists()
    source = migration.read_text(encoding="utf-8")
    assert 'revision: str = "20260713_0005"' in source
    assert 'down_revision: Union[str, None] = "20260713_0004"' in source


def test_dossier_public_read_is_ordered(client, create_project, admin_headers):
    project = create_project(slug="dossier-project")
    response = client.put(
        f"/api/v1/dossiers/projects/{project.id}",
        headers=admin_headers,
        json=valid_dossier_payload(),
    )

    assert response.status_code == 200
    public = client.get("/api/v1/dossiers/dossier-project?language=en")
    assert public.status_code == 200
    assert public.json()["impact"] == "Built a reliable scheduling workflow."
    assert public.json()["metrics"][0]["label"] == "coverage"


def test_dossier_mutations_are_admin_only(client, create_project, user_headers):
    project = create_project(slug="protected-dossier")
    response = client.put(
        f"/api/v1/dossiers/projects/{project.id}",
        headers=user_headers,
        json=valid_dossier_payload(),
    )

    assert response.status_code == 403


def test_invalid_replace_keeps_previous_aggregate(client, create_project, admin_headers):
    project = create_project(slug="atomic-dossier")
    assert client.put(
        f"/api/v1/dossiers/projects/{project.id}",
        headers=admin_headers,
        json=valid_dossier_payload(),
    ).status_code == 200

    invalid = valid_dossier_payload()
    invalid["gallery"] = [{"id": "x", "src": "javascript:bad", "caption": "x"}]
    rejected = client.put(
        f"/api/v1/dossiers/projects/{project.id}",
        headers=admin_headers,
        json=invalid,
    )
    assert rejected.status_code == 422

    unchanged = client.get("/api/v1/dossiers/atomic-dossier")
    assert unchanged.json()["metrics"][0]["label"] == "coverage"


def test_project_delete_cascades_dossier(client, create_project, admin_headers):
    project = create_project(slug="cascade-dossier")
    assert client.put(
        f"/api/v1/dossiers/projects/{project.id}",
        headers=admin_headers,
        json=valid_dossier_payload(),
    ).status_code == 200
    assert client.delete(
        f"/api/v1/projects/{project.id}", headers=admin_headers
    ).status_code == 204
    assert client.get("/api/v1/dossiers/cascade-dossier").status_code == 404
