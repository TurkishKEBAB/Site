"""Regression coverage for the production NETAŞ experience data migration."""

import importlib.util
from datetime import date
from pathlib import Path

from alembic.migration import MigrationContext
from alembic.operations import Operations

from app.models.experience import Experience, ExperienceTranslation


def _load_migration():
    migration_path = (
        Path(__file__).parents[1]
        / "alembic"
        / "versions"
        / "20260807_0008_refresh_netas_experience.py"
    )
    spec = importlib.util.spec_from_file_location(
        "refresh_netas_experience", migration_path
    )
    migration = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(migration)
    return migration


def _run_upgrade(db_session, migration):
    context = MigrationContext.configure(db_session.connection())
    with Operations.context(Operations(context)):
        migration.upgrade()


def test_netas_experience_migration_refreshes_existing_rows_idempotently(db_session):
    experience = Experience(
        title="Software Engineering Intern",
        organization="NETAS Telekomunikasyon A.S.",
        location="Istanbul, Turkiye",
        experience_type="work",
        start_date=date(2026, 1, 1),
        end_date=date(2026, 2, 1),
        description="Legacy description",
        display_order=3,
    )
    db_session.add(experience)
    db_session.flush()
    db_session.add_all(
        [
            ExperienceTranslation(
                experience_id=experience.id,
                language="en",
                title="Software Engineering Intern",
                organization="NETAS Telekomunikasyon A.S.",
                location="Istanbul, Turkiye",
                description="Legacy English description",
            ),
            ExperienceTranslation(
                experience_id=experience.id,
                language="tr",
                title="Yazilim Muhendisligi Stajyeri",
                organization="NETAS Telekomunikasyon A.S.",
                location="Istanbul, Turkiye",
                description="Legacy Turkish description",
            ),
        ]
    )
    db_session.commit()

    migration = _load_migration()
    _run_upgrade(db_session, migration)
    _run_upgrade(db_session, migration)
    db_session.expire_all()

    refreshed = db_session.get(Experience, experience.id)
    assert refreshed.organization == "NETAŞ"
    assert refreshed.description.startswith(
        "Within a six-person team, I contributed production-quality code and tests"
    )
    assert (
        db_session.query(ExperienceTranslation)
        .filter_by(experience_id=experience.id)
        .count()
        == 2
    )

    translations = {
        item.language: item
        for item in db_session.query(ExperienceTranslation)
        .filter_by(experience_id=experience.id)
        .all()
    }
    assert translations["en"].organization == "NETAŞ"
    assert translations["tr"].organization == "NETAŞ"
    assert "UTC ve UTC+3" in translations["tr"].description
    assert "Spring Cloud Config" in translations["tr"].description
