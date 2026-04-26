"""baseline schema from SQLAlchemy models."""

from typing import Sequence, Union

import app.models as app_models  # noqa: F401
from alembic import op
from app.database import Base

revision: str = "20260426_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create model tables when bootstrapping an empty database."""
    Base.metadata.create_all(bind=op.get_bind(), checkfirst=True)


def downgrade() -> None:
    """Drop model tables for full baseline rollback."""
    Base.metadata.drop_all(bind=op.get_bind(), checkfirst=True)
