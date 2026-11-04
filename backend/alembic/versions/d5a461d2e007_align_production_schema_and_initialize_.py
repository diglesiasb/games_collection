
"""align production schema and initialize OpenCritic usage

Revision ID: d5a461d2e007
Revises: 35b36d8c5355
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd5a461d2e007'
down_revision: Union[str, Sequence[str], None] = '35b36d8c5355'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    genre_column_added = False
    genre_unique_created = False
    release_date_changed = False
    usage_row_created = False

    # Add genre.id_opencritic if missing.
    genre_columns = {
        column["name"]
        for column in inspector.get_columns("genre")
    }

    if "id_opencritic" not in genre_columns:
        op.add_column(
            "genre",
            sa.Column("id_opencritic", sa.Integer(), nullable=True)
        )
        genre_column_added = True

    # Check existing unique constraints and indexes by column.
    inspector = sa.inspect(conn)

    unique_constraints = inspector.get_unique_constraints("genre")
    unique_indexes = inspector.get_indexes("genre")

    has_unique = any(
        set(constraint.get("column_names") or []) == {"id_opencritic"}
        for constraint in unique_constraints
    ) or any(
        index.get("unique")
        and set(index.get("column_names") or []) == {"id_opencritic"}
        for index in unique_indexes
    )

    if not has_unique:
        op.create_unique_constraint(
            "genre_id_opencritic_key",
            "genre",
            ["id_opencritic"]
        )
        genre_unique_created = True

    # Make release_date nullable if currently NOT NULL.
    inspector = sa.inspect(conn)

    game_platform_columns = {
        column["name"]: column
        for column in inspector.get_columns("game_platform")
    }

    if not game_platform_columns["release_date"]["nullable"]:
        op.alter_column(
            "game_platform",
            "release_date",
            existing_type=sa.Date(),
            nullable=True
        )
        release_date_changed = True

    # Initialize OpenCritic usage only if row 1 is missing.
    usage_exists = conn.execute(
        sa.text("""
            SELECT 1
            FROM opencritic_usage
            WHERE id = 1
        """)
    ).scalar_one_or_none()

    if usage_exists is None:
        conn.execute(
            sa.text("""
                INSERT INTO opencritic_usage (id)
                VALUES (1)
            """)
        )
        usage_row_created = True

    # Record exactly which changes this migration performed.
    op.create_table(
        "d5a461d2e007_changes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("genre_column_added", sa.Boolean(), nullable=False),
        sa.Column("genre_unique_created", sa.Boolean(), nullable=False),
        sa.Column("release_date_changed", sa.Boolean(), nullable=False),
        sa.Column("usage_row_created", sa.Boolean(), nullable=False)
    )

    conn.execute(
        sa.text("""
            INSERT INTO d5a461d2e007_changes (
                id,
                genre_column_added,
                genre_unique_created,
                release_date_changed,
                usage_row_created
            )
            VALUES (1, :column_added, :unique_created,
                    :release_changed, :usage_created)
        """),
        {
            "column_added": genre_column_added,
            "unique_created": genre_unique_created,
            "release_changed": release_date_changed,
            "usage_created": usage_row_created
        }
    )


def downgrade() -> None:
    conn = op.get_bind()

    changes = conn.execute(
        sa.text("""
            SELECT *
            FROM d5a461d2e007_changes
            WHERE id = 1
        """)
    ).mappings().one()

    # Delete only the usage row created by this migration.
    if changes["usage_row_created"]:
        conn.execute(
            sa.text("""
                DELETE FROM opencritic_usage
                WHERE id = 1
            """)
        )

    # Restore the original NOT NULL constraint if changed.
    if changes["release_date_changed"]:
        op.alter_column(
            "game_platform",
            "release_date",
            existing_type=sa.Date(),
            nullable=False
        )

    # Drop only the unique constraint created by this migration.
    if changes["genre_unique_created"]:
        op.drop_constraint(
            "genre_id_opencritic_key",
            "genre",
            type_="unique"
        )

    # Drop the column only if this migration added it.
    if changes["genre_column_added"]:
        op.drop_column("genre", "id_opencritic")

    op.drop_table("d5a461d2e007_changes")
