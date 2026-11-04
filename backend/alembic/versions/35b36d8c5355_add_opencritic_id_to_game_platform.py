"""add opencritic id to game platform

Revision ID: 35b36d8c5355
Revises: 96037b1e0648
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "35b36d8c5355"
down_revision: Union[str, None] = "96037b1e0648"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    columns = {
        column["name"]
        for column in inspector.get_columns("game_platform")
    }

    if "id_opencritic" not in columns:
        op.add_column(
            "game_platform",
            sa.Column("id_opencritic", sa.Integer(), nullable=True)
        )

    inspector = sa.inspect(bind)
    unique_constraints = {
        constraint["name"]
        for constraint in inspector.get_unique_constraints("game_platform")
    }

    if "uq_game_platform_id_opencritic" not in unique_constraints:
        op.create_unique_constraint(
            "uq_game_platform_id_opencritic",
            "game_platform",
            ["id_opencritic"]
        )


def downgrade() -> None:
    op.drop_constraint(
        "uq_game_platform_id_opencritic",
        "game_platform",
        type_="unique"
    )
    op.drop_column("game_platform", "id_opencritic")
