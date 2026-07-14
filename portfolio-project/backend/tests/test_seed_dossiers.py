"""The embedded dossier seed content must satisfy the upsert schema."""

import seed_dossiers
from app.schemas.dossier import ProjectDossierUpsert

EXPECTED_SLUGS = {
    "isikschedule-platform",
    "teknofest-sarkan-uav-defense-platform",
    "agentic-ide-thesis-project",
    "automated-web-crawler",
    "portfolio-platform-web-desktop",
}


def test_seed_content_covers_expected_projects():
    assert set(seed_dossiers.DOSSIER_CONTENT) == EXPECTED_SLUGS


def test_seed_content_validates_against_upsert_schema():
    for slug, content in seed_dossiers.DOSSIER_CONTENT.items():
        payload = ProjectDossierUpsert.model_validate(content)
        assert payload.impact_en and payload.impact_tr, slug
        assert payload.c4, f"{slug}: architecture (c4) must not be empty"
        assert payload.metrics, f"{slug}: metrics must not be empty"


def test_seed_content_diagrams_do_not_duplicate_c4():
    # The frontend synthesizes the C4 gallery entry from the `c4` field;
    # a seeded diagram with id "c4" would render twice.
    for slug, content in seed_dossiers.DOSSIER_CONTENT.items():
        ids = [diagram["id"] for diagram in content["diagrams"]]
        assert "c4" not in ids, slug
