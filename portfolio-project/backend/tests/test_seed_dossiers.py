"""The embedded dossier seed content must satisfy the upsert schema."""

from pathlib import Path

import seed_dossiers
from app.crud.dossier import get_dossier_by_project_id, upsert_dossier
from app.models.dossier import ProjectDossier
from app.models.project import Project
from app.models.site import SiteConfig
from app.schemas.dossier import ProjectDossierUpsert

EXPECTED_SLUGS = {
    "isikschedule-platform",
    "agentic-ide-thesis-project",
    "portfolio-platform-web-desktop",
    "ramazan-kopru-academic-site",
    "travel-planner-platform",
    "turkish-morphology-fst",
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


def test_seed_module_does_not_retain_legacy_marketing_payloads():
    assert not hasattr(seed_dossiers, "_LEGACY_DOSSIER_CONTENT")


def test_seed_gallery_assets_exist_in_frontend_public():
    project_root = Path(__file__).resolve().parents[2]
    for slug, content in seed_dossiers.DOSSIER_CONTENT.items():
        for item in content["gallery"]:
            source = item["src"]
            assert source.startswith("/projects/"), f"{slug}: {source}"
            asset = project_root / "frontend" / "public" / source.lstrip("/")
            assert asset.is_file(), f"{slug}: missing gallery asset {source}"


def test_audited_projects_have_source_catalog_records_and_remote_provenance():
    audited_slugs = {
        "ramazan-kopru-academic-site",
        "travel-planner-platform",
        "turkish-morphology-fst",
    }
    assert audited_slugs <= set(seed_dossiers.PROJECT_CATALOG_CONTENT)
    for slug in audited_slugs:
        assert seed_dossiers.PROJECT_CATALOG_CONTENT[slug]["github_url"].startswith(
            "https://github.com/"
        )


def test_sync_dossiers_is_revisioned_and_removes_pending_records(
    db_session, create_project
):
    active = create_project(slug="portfolio-platform-web-desktop")
    pending = create_project(slug="automated-web-crawler")
    stale_payload = ProjectDossierUpsert.model_validate(
        {
            "impact_en": "Legacy dossier that must be replaced.",
            "impact_tr": "Degistirilmesi gereken eski dossier.",
            "metrics": [],
            "c4": [],
            "adrs": [],
            "log": [],
            "diagrams": [],
            "gallery": [],
        }
    )
    upsert_dossier(db_session, active.id, stale_payload)
    upsert_dossier(db_session, pending.id, stale_payload)

    assert seed_dossiers.sync_dossiers(db_session) is True

    refreshed = get_dossier_by_project_id(db_session, active.id)
    assert refreshed is not None
    assert (
        refreshed.impact_en == seed_dossiers.DOSSIER_CONTENT[active.slug]["impact_en"]
    )
    assert (
        db_session.query(ProjectDossier).filter_by(project_id=pending.id).first()
        is None
    )
    assert (
        db_session.query(Project)
        .filter_by(slug="ramazan-kopru-academic-site")
        .one()
        .github_url
        == "https://github.com/TurkishKEBAB/RamazanKopru"
    )
    revision = (
        db_session.query(SiteConfig)
        .filter_by(key=seed_dossiers.DOSSIER_SEED_REVISION_KEY)
        .one()
    )
    assert revision.value == seed_dossiers.DOSSIER_SEED_REVISION

    assert seed_dossiers.sync_dossiers(db_session) is False
