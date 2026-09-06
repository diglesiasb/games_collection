from pydantic import BaseModel
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date

collection_items = relationship(
    "CollectionItem",
    back_populates="game"
)


class GameCreate(BaseModel):
    title: str
    developer: str
    publisher: str
    opencritic_score: int | None = None

class GameCollectionItemPlatform(BaseModel):
    id_game_platform: int
    name: str

class GamePlatformResponse(BaseModel):
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


class GameResponse(BaseModel):
    id_game: int
    title: str
    developer: str
    publisher: str
    opencritic_score: int | None
    platforms: list[GamePlatformResponse]
    collection_items: list[GameCollectionItemResponse]