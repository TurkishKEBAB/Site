"""add admin role flag, audit log, and login lockout fields."""

import os
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect
from sqlalchemy.dialects import postgresql

revision: str = "20260426_0002"
down_revision: Union[str, None] = "20260426_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table_name: str, column_name: str) -> bool:
    inspector = inspect(op.get_bind())
    return column_name in {
        column["name"] for column in inspector.get_columns(table_name)
    }


def _has_table(table_name: str) -> bool:
    return inspect(op.get_bind()).has_table(table_name)


def _bootstrap_admin_flags() -> None:
    emails = [
        email.strip().lower()
        for email in os.getenv("ADMIN_EMAILS", "").split(",")
        if email.strip()
    ]
    if not emails:
        return

    bind = op.get_bind()
    for email in emails:
        bind.execute(
            sa.text(
                "UPDATE users SET is_admin = :is_admin WHERE lower(email) = :email"
            ),
            {"is_admin": True, "email": email},
        )


def upgrade() -> None:
    if not _has_column("users", "is_admin"):
        op.add_column(
            "users",
            sa.Column(
                "is_admin",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
        )
    if not _has_column("users", "failed_login_count"):
        op.add_column(
            "users",
            sa.Column(
                "failed_login_count",
                sa.Integer(),
                nullable=False,
                server_default="0",
            ),
        )
    if not _has_column("users", "locked_until"):
        op.add_column(
            "users",
            sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
        )

    _bootstrap_admin_flags()

    if not _has_table("admin_action_logs"):
        op.create_table(
            "admin_action_logs",
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("actor_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("action", sa.String(length=100), nullable=False),
            sa.Column("target_type", sa.String(length=100), nullable=False),
            sa.Column("target_id", sa.String(length=128), nullable=True),
            sa.Column(
                "details",
                sa.JSON().with_variant(postgresql.JSONB(), "postgresql"),
                nullable=True,
            ),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=True,
            ),
            sa.ForeignKeyConstraint(
                ["actor_id"],
                ["users.id"],
                ondelete="SET NULL",
            ),
            sa.PrimaryKeyConstraint("id"),
        )

    for index_name, columns in {
        "ix_admin_action_logs_actor_id": ["actor_id"],
        "ix_admin_action_logs_action": ["action"],
        "ix_admin_action_logs_target_type": ["target_type"],
        "ix_admin_action_logs_target_id": ["target_id"],
        "ix_admin_action_logs_created_at": ["created_at"],
    }.items():
        op.create_index(
            index_name,
            "admin_action_logs",
            columns,
            unique=False,
            if_not_exists=True,
        )


def downgrade() -> None:
    for index_name in (
        "ix_admin_action_logs_created_at",
        "ix_admin_action_logs_target_id",
        "ix_admin_action_logs_target_type",
        "ix_admin_action_logs_action",
        "ix_admin_action_logs_actor_id",
    ):
        op.drop_index(
            index_name,
            table_name="admin_action_logs",
            if_exists=True,
        )

    if _has_table("admin_action_logs"):
        op.drop_table("admin_action_logs")

    with op.batch_alter_table("users") as batch_op:
        if _has_column("users", "locked_until"):
            batch_op.drop_column("locked_until")
        if _has_column("users", "failed_login_count"):
            batch_op.drop_column("failed_login_count")
        if _has_column("users", "is_admin"):
            batch_op.drop_column("is_admin")
