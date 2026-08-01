import importlib.util
from pathlib import Path

import sqlalchemy as sa
from alembic.migration import MigrationContext
from alembic.operations import Operations


def test_adalab_cleanup_migration_is_chained_and_deletes_public_records():
    migration_path = Path("backend/alembic/versions/20260801_0006_remove_adalab_experience.py")
    source = migration_path.read_text(encoding="utf-8")

    assert 'revision: str = "20260801_0006"' in source
    assert 'down_revision: Union[str, None] = "20260713_0005"' in source
    assert "experience_translations" in source
    assert "experiences" in source
    assert "adalab" in source.lower()


def test_adalab_cleanup_migration_removes_experience_and_translations():
    migration_path = Path("backend/alembic/versions/20260801_0006_remove_adalab_experience.py")
    spec = importlib.util.spec_from_file_location("remove_adalab_experience", migration_path)
    migration = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(migration)

    engine = sa.create_engine("sqlite:///:memory:")
    with engine.begin() as connection:
        connection.execute(
            sa.text(
                """
                CREATE TABLE experiences (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    organization TEXT NOT NULL
                )
                """
            )
        )
        connection.execute(
            sa.text(
                """
                CREATE TABLE experience_translations (
                    id TEXT PRIMARY KEY,
                    experience_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    organization TEXT NOT NULL
                )
                """
            )
        )
        connection.execute(
            sa.text(
                """
                INSERT INTO experiences (id, title, organization) VALUES
                ('adalab-id', 'Software Engineer', 'AdaLab'),
                ('netas-id', 'Software Engineer Intern', 'NETAS')
                """
            )
        )
        connection.execute(
            sa.text(
                """
                INSERT INTO experience_translations (id, experience_id, title, organization) VALUES
                ('adalab-en', 'adalab-id', 'Software Engineer', 'AdaLab'),
                ('netas-en', 'netas-id', 'Software Engineer Intern', 'NETAS')
                """
            )
        )

        migration.op = Operations(MigrationContext.configure(connection))
        migration.upgrade()

        remaining_experiences = connection.execute(sa.text("SELECT id FROM experiences")).scalars().all()
        remaining_translations = connection.execute(
            sa.text("SELECT id FROM experience_translations")
        ).scalars().all()

    assert remaining_experiences == ["netas-id"]
    assert remaining_translations == ["netas-en"]
