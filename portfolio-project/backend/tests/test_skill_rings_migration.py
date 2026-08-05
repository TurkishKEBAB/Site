import importlib.util
from pathlib import Path

import sqlalchemy as sa
from alembic.migration import MigrationContext
from alembic.operations import Operations


MIGRATION_PATH = Path("backend/alembic/versions/20260805_0007_realign_skill_rings.py")


def _load_migration():
    spec = importlib.util.spec_from_file_location("realign_skill_rings", MIGRATION_PATH)
    migration = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(migration)
    return migration


def test_skill_ring_migration_realigns_core_and_devops_skills():
    migration = _load_migration()
    engine = sa.create_engine("sqlite:///:memory:")

    with engine.begin() as connection:
        connection.execute(sa.text("CREATE TABLE skills (name TEXT, ring TEXT)"))
        connection.execute(
            sa.text("INSERT INTO skills (name, ring) VALUES (:name, :ring)"),
            [
                {"name": "Java", "ring": "trial"},
                {"name": "Python", "ring": "trial"},
                {"name": "Maven/Gradle", "ring": "trial"},
                {"name": "Docker", "ring": "adopt"},
                {"name": "Kubernetes", "ring": "assess"},
            ],
        )

        migration.op = Operations(MigrationContext.configure(connection))
        migration.upgrade()

        rings = dict(connection.execute(sa.text("SELECT name, ring FROM skills")).all())

    assert rings == {
        "Java": "adopt",
        "Python": "adopt",
        "Maven/Gradle": "adopt",
        "Docker": "trial",
        "Kubernetes": "assess",
    }
