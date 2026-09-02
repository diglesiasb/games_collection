from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class GameGenre(Base):
    __tablename__ = "game_genre"

    id_game: Mapped[int] = mapped_column(
        ForeignKey("game.id_game"),
        primary_key=True
    )

    id_genre: Mapped[int] = mapped_column(
        ForeignKey("genre.id_genre"),
        primary_key=True
    )


game_genre_table = GameGenre.__table__