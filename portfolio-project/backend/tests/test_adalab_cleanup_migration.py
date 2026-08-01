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
                    organization TEXT NOT NULL,
                    description TEXT
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
                    organization TEXT NOT NULL,
                    description TEXT
                )
                """
            )
        )
        connection.execute(
            sa.text(
                """
                INSERT INTO experiences (id, title, organization, description) VALUES
                ('adalab-id', 'Software Engineer', 'AdaLab', NULL),
                ('netas-id', 'Software Engineer Intern', 'NETAS', NULL),
                ('legacy-edu-id', 'Bachelor of Software Engineering', 'Isik University',
                 'Member of IEEE Student Branch. Student Assistant for OOP. '
                 || 'AdaLab assistant at The Academic Data Analytics Laboratory.'),
                ('odd-wording-id', 'Researcher', 'Isik University',
                 'Worked with the adalab team on analytics.')
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

        remaining_experiences = connection.execute(
            sa.text("SELECT id FROM experiences ORDER BY id")
        ).scalars().all()
        remaining_translations = connection.execute(
            sa.text("SELECT id FROM experience_translations")
        ).scalars().all()
        descriptions = dict(
            connection.execute(sa.text("SELECT id, description FROM experiences")).all()
        )

    assert remaining_experiences == ["legacy-edu-id", "netas-id", "odd-wording-id"]
    assert remaining_translations == ["netas-en"]
    # The education record keeps its own history but loses the retired mention.
    assert descriptions["legacy-edu-id"] == "Member of IEEE Student Branch. Student Assistant for OOP."
    # Wording the targeted replace cannot match is dropped rather than leaked.
    assert descriptions["odd-wording-id"] is None
