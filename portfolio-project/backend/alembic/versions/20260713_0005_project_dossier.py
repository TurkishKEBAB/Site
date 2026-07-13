"""create project dossier aggregate tables

Revision ID: 20260713_0005
Revises: 20260713_0004
Create Date: 2026-07-13
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260713_0005"
down_revision: Union[str, None] = "20260713_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _id_column() -> sa.Column:
    return sa.Column("id", sa.UUID(as_uuid=True), primary_key=True)


def upgrade() -> None:
    op.create_table(
        "project_dossiers",
        _id_column(),
        sa.Column(
            "project_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("impact_en", sa.Text(), nullable=False),
        sa.Column("impact_tr", sa.Text(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
        if_not_exists=True,
    )
    op.create_index(
        "ix_project_dossiers_project_id",
        "project_dossiers",
        ["project_id"],
        unique=True,
        if_not_exists=True,
    )

    op.create_table(
        "dossier_metrics",
        _id_column(),
        sa.Column(
            "dossier_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("project_dossiers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("value", sa.String(length=255), nullable=False),
        sa.Column("numeric_value", sa.Numeric(18, 4), nullable=True),
        sa.Column("label", sa.String(length=255), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_metrics_dossier_id",
        "dossier_metrics",
        ["dossier_id"],
        unique=False,
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_metrics_display_order",
        "dossier_metrics",
        ["display_order"],
        unique=False,
        if_not_exists=True,
    )

    op.create_table(
        "dossier_c4_levels",
        _id_column(),
        sa.Column(
            "dossier_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("project_dossiers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("label", sa.String(length=255), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_c4_levels_dossier_id",
        "dossier_c4_levels",
        ["dossier_id"],
        unique=False,
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_c4_levels_display_order",
        "dossier_c4_levels",
        ["display_order"],
        unique=False,
        if_not_exists=True,
    )

    op.create_table(
        "dossier_c4_nodes",
        _id_column(),
        sa.Column(
            "level_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("dossier_c4_levels.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("sub", sa.Text(), nullable=True),
        sa.Column("leaf", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("tier_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_c4_nodes_level_id",
        "dossier_c4_nodes",
        ["level_id"],
        unique=False,
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_c4_nodes_tier_order",
        "dossier_c4_nodes",
        ["tier_order"],
        unique=False,
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_c4_nodes_display_order",
        "dossier_c4_nodes",
        ["display_order"],
        unique=False,
        if_not_exists=True,
    )

    op.create_table(
        "dossier_adrs",
        _id_column(),
        sa.Column(
            "dossier_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("project_dossiers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("identifier", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=64), nullable=False),
        sa.Column("date", sa.String(length=32), nullable=True),
        sa.Column("context", sa.Text(), nullable=False),
        sa.Column("decision", sa.Text(), nullable=False),
        sa.Column("tradeoff", sa.Text(), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_adrs_dossier_id",
        "dossier_adrs",
        ["dossier_id"],
        unique=False,
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_adrs_display_order",
        "dossier_adrs",
        ["display_order"],
        unique=False,
        if_not_exists=True,
    )

    op.create_table(
        "dossier_log_entries",
        _id_column(),
        sa.Column(
            "dossier_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("project_dossiers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("commit_hash", sa.String(length=64), nullable=False),
        sa.Column("tag", sa.String(length=64), nullable=True),
        sa.Column("date", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_log_entries_dossier_id",
        "dossier_log_entries",
        ["dossier_id"],
        unique=False,
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_log_entries_display_order",
        "dossier_log_entries",
        ["display_order"],
        unique=False,
        if_not_exists=True,
    )

    op.create_table(
        "dossier_diagrams",
        _id_column(),
        sa.Column(
            "dossier_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("project_dossiers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("identifier", sa.String(length=128), nullable=False),
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_diagrams_dossier_id",
        "dossier_diagrams",
        ["dossier_id"],
        unique=False,
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_diagrams_display_order",
        "dossier_diagrams",
        ["display_order"],
        unique=False,
        if_not_exists=True,
    )

    op.create_table(
        "dossier_gallery_items",
        _id_column(),
        sa.Column(
            "dossier_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("project_dossiers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("identifier", sa.String(length=128), nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=False),
        sa.Column("caption", sa.Text(), nullable=False),
        sa.Column("hint", sa.Text(), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_gallery_items_dossier_id",
        "dossier_gallery_items",
        ["dossier_id"],
        unique=False,
        if_not_exists=True,
    )
    op.create_index(
        "ix_dossier_gallery_items_display_order",
        "dossier_gallery_items",
        ["display_order"],
        unique=False,
        if_not_exists=True,
    )


def downgrade() -> None:
    for table in (
        "dossier_gallery_items",
        "dossier_diagrams",
        "dossier_log_entries",
        "dossier_adrs",
        "dossier_c4_nodes",
        "dossier_c4_levels",
        "dossier_metrics",
    ):
        op.drop_table(table, if_exists=True)
    op.drop_index(
        "ix_project_dossiers_project_id", table_name="project_dossiers", if_exists=True
    )
    op.drop_table("project_dossiers", if_exists=True)
