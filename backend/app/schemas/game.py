from pydantic import BaseModel
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date

from .game_platform import GamePlatformSummary

collection_items = relationship(
    "CollectionItem",
    back_populates="game"
)


class GameCreate(BaseModel):
    title: str
    developer: str
    publisher: str
    opencritic_score: int | None = None


class GameUpdate(BaseModel):
    title: str
    developer: str
    publisher: str
    opencritic_score: int | None = None
    genres: list[int]

class GameCollectionItemPlatform(BaseModel):
    id_game_platform: int
    name: str

class GameCollectionItemResponse(BaseModel):
    id_collection_item: int
    platform: GameCollectionItemPlatform
    edition: str
    type: str
    release_date: date
    purchase_date: date | None
    starting_date: date | None
    finish_date: date | None
    finished: bool
    total_hours: int | None

class GameGenreResponse(BaseModel):
    id_genre: int
    genre: str

class GameResponse(BaseModel):
    id_game: int
    title: str
    developer: str
    publisher: str
    opencritic_score: int | None
    platforms: list[GamePlatformSummary]
    collection_items: list[GameCollectionItemResponse]
    genres: list[GameGenreResponse]

