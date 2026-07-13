"""skill domain + ring replace proficiency

Aligns the Skill model with the public site: `domain` is the CapabilityMatrix
group (backend/cloud/product/testing/research) and `ring` is the TechRadar ring
(adopt/trial/assess/hold). The outdated `proficiency` percentage is dropped.

Revision ID: 20260713_0003
Revises: 20260426_0002
Create Date: 2026-07-13
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "20260713_0003"
down_revision: Union[str, None] = "20260426_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table_name: str, column_name: str) -> bool:
    inspector = inspect(op.get_bind())
    return column_name in {
        column["name"] for column in inspector.get_columns(table_name)
    }


def _has_index(table_name: str, index_name: str) -> bool:
    inspector = inspect(op.get_bind())
    return index_name in {index["name"] for index in inspector.get_indexes(table_name)}


def upgrade() -> None:
    if not _has_column("skills", "domain"):
        op.add_column(
            "skills",
            sa.Column(
                "domain", sa.String(length=50), server_default="backend", nullable=False
            ),
        )
    if not _has_column("skills", "ring"):
        op.add_column(
            "skills",
            sa.Column(
                "ring", sa.String(length=20), server_default="assess", nullable=False
            ),
        )
    if not _has_index("skills", op.f("ix_skills_domain")):
        op.create_index(op.f("ix_skills_domain"), "skills", ["domain"], unique=False)
    if _has_column("skills", "proficiency"):
        op.drop_column("skills", "proficiency")


def downgrade() -> None:
    if not _has_column("skills", "proficiency"):
        op.add_column(
            "skills",
            sa.Column("proficiency", sa.Integer(), server_default="50", nullable=False),
        )
    if _has_index("skills", op.f("ix_skills_domain")):
        op.drop_index(op.f("ix_skills_domain"), table_name="skills")
    if _has_column("skills", "ring"):
        op.drop_column("skills", "ring")
    if _has_column("skills", "domain"):
        op.drop_column("skills", "domain")
