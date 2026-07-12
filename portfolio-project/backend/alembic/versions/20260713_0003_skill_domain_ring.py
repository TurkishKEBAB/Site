"""skill domain + ring replace proficiency

Aligns the Skill model with the public site: `domain` is the CapabilityMatrix
group (backend/cloud/product/testing/research) and `ring` is the TechRadar ring
(adopt/trial/assess/hold). The outdated `proficiency` percentage is dropped.

Revision ID: 20260713_0003
Revises: 20260426_0002
Create Date: 2026-07-13
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260713_0003"
down_revision: Union[str, None] = "20260426_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "skills",
        sa.Column("domain", sa.String(length=50), server_default="backend", nullable=False),
    )
    op.add_column(
        "skills",
        sa.Column("ring", sa.String(length=20), server_default="assess", nullable=False),
    )
    op.create_index(op.f("ix_skills_domain"), "skills", ["domain"], unique=False)
    op.drop_column("skills", "proficiency")


def downgrade() -> None:
    op.add_column(
        "skills",
        sa.Column("proficiency", sa.Integer(), server_default="50", nullable=False),
    )
    op.drop_index(op.f("ix_skills_domain"), table_name="skills")
    op.drop_column("skills", "ring")
    op.drop_column("skills", "domain")
