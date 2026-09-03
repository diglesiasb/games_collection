from sqlalchemy import CheckConstraint, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from pydantic import BaseModel

from ..database import Base
from .game_genre import game_genre_table


class Game(Base):
    __tablename__ = "game"

    id_game: Mapped[int] = mapped_column(
        primary_key=True
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    developer: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    publisher: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    opencritic_score: Mapped[int | None] = mapped_column(
        nullable=True
    )

    genres = relationship(
        "Genre",
        secondary=game_genre_table,
        back_populates="games"
    )

    collection_items = relationship(
        "CollectionItem",
        back_populates="game"
    )

    __table_args__ = (
        CheckConstraint(
            "opencritic_score >= 0 AND opencritic_score <= 100",
            name="ck_game_opencritic_score",
        ),
    )