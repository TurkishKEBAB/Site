"""add tags to blog posts

Revision ID: 20260713_0004
Revises: 20260713_0003
Create Date: 2026-07-13
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "20260713_0004"
down_revision: Union[str, None] = "20260713_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table_name: str, column_name: str) -> bool:
    inspector = inspect(op.get_bind())
    return column_name in {
        column["name"] for column in inspector.get_columns(table_name)
    }


def upgrade() -> None:
    if not _has_column("blog_posts", "tags"):
        op.add_column(
            "blog_posts",
            sa.Column(
                "tags",
                sa.JSON(),
                server_default=sa.text("'[]'"),
                nullable=False,
            ),
        )


def downgrade() -> None:
    if _has_column("blog_posts", "tags"):
        op.drop_column("blog_posts", "tags")
