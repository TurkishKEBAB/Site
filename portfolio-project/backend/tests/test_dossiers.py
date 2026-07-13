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
