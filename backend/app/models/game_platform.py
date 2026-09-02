from datetime import date

from sqlalchemy import Date, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class GamePlatform(Base):
    __tablename__ = "game_platform"

    id_game_platform: Mapped[int] = mapped_column(
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True
    )

    release_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    purchase_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    collection_items = relationship(
        "CollectionItem",
        back_populates="game_platform"
    )