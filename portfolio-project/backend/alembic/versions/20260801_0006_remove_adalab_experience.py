"""remove the retired research organization from public experiences

Revision ID: 20260801_0006
Revises: 20260713_0005
Create Date: 2026-08-01
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260801_0006"
down_revision: Union[str, None] = "20260713_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# The legacy SQL seed mentions the organization inside an unrelated education
# record's description, which the row filter below deliberately keeps. Strip
# that sentence, then null out anything still matching so no wording escapes.
LEGACY_SENTENCE = "AdaLab assistant at The Academic Data Analytics Laboratory."


def _scrub_descriptions(table: str) -> None:
    op.execute(
        sa.text(
            f"""
            UPDATE {table}
            SET description = TRIM(REPLACE(description, :sentence, ''))
            WHERE LOWER(description) LIKE '%adalab%'
            """
        ).bindparams(sentence=LEGACY_SENTENCE)
    )
    op.execute(
        sa.text(
            f"""
            UPDATE {table}
            SET description = NULL
            WHERE LOWER(description) LIKE '%adalab%'
            """
        )
    )


def upgrade() -> None:
    """Delete the retired organization's records and scrub lingering mentions."""
    organization_filter = """
        LOWER(organization) LIKE '%adalab%'
        OR LOWER(title) LIKE '%adalab%'
    """
    op.execute(
        sa.text(
            f"""
            DELETE FROM experience_translations
            WHERE experience_id IN (
                SELECT id FROM experiences WHERE {organization_filter}
            )
            """
        )
    )
    op.execute(sa.text(f"DELETE FROM experiences WHERE {organization_filter}"))

    _scrub_descriptions("experiences")
    _scrub_descriptions("experience_translations")


def downgrade() -> None:
    """The deleted public record is intentionally not recreated on downgrade."""
