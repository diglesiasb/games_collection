
"""sync game OpenCritic fields

Revision ID: 96037b1e0648
Revises: e73bb1434ec0
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "96037b1e0648"
down_revision: Union[str, Sequence[str], None] = "e73bb1434ec0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "game",
        sa.Column("id_opencritic", sa.Integer(), nullable=True),
    )
    op.add_column(
        "game",
        sa.Column(
            "opencritic_updated_at",
            sa.DateTime(),
            nullable=True,
        ),
    )
    op.create_unique_constraint(
        "uq_game_id_opencritic",
        "game",
        ["id_opencritic"],
    )
    op.alter_column(
        "game",
        "developer",
        existing_type=sa.String(length=255),
        nullable=True,
    )
    op.alter_column(
        "game",
        "publisher",
        existing_type=sa.String(length=255),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "game",
        "publisher",
        existing_type=sa.String(length=255),
        nullable=False,
    )
    op.alter_column(
        "game",
        "developer",
        existing_type=sa.String(length=255),
        nullable=False,
    )
    op.drop_constraint(
        "uq_game_id_opencritic",
        "game",
        type_="unique",
    )
    op.drop_column("game", "opencritic_updated_at")
    op.drop_column("game", "id_opencritic")
