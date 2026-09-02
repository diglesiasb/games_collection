from datetime import date

from sqlalchemy import Boolean, CheckConstraint, Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class CollectionItem(Base):
    __tablename__ = "collection_item"

    id_collection_item: Mapped[int] = mapped_column(
        primary_key=True
    )

    id_game: Mapped[int] = mapped_column(
        ForeignKey("game.id_game"),
        nullable=False
    )

    id_game_platform: Mapped[int] = mapped_column(
        ForeignKey("game_platform.id_game_platform"),
        nullable=False
    )

    edition: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    type: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    release_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    purchase_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    starting_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    finish_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    finished: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    total_hours: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    game = relationship(
        "Game",
        back_populates="collection_items"
    )

    game_platform = relationship(
        "GamePlatform",
        back_populates="collection_items"
    )

    __table_args__ = (
        CheckConstraint(
            "type IN ('Physical', 'Digital')",
            name="ck_collection_item_type"
        ),
        CheckConstraint(
            "total_hours >= 0",
            name="ck_collection_item_total_hours"
        ),
    )