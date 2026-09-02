from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base
from .game_genre import game_genre_table


class Genre(Base):
    __tablename__ = "genre"

    id_genre: Mapped[int] = mapped_column(
        primary_key=True
    )

    genre: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True
    )

    games = relationship(
        "Game",
        secondary=game_genre_table,
        back_populates="genres"
    )