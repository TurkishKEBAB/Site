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


def upgrade() -> None:
    """Delete the retired organization's records and their translations."""
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


def downgrade() -> None:
    """The deleted public record is intentionally not recreated on downgrade."""
