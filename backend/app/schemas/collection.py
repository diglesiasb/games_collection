from datetime import date
from pydantic import BaseModel

from .collection_item import CollectionItemBase

class CollectionCreate(CollectionItemBase):
    # Game
    title: str
    developer: str | None = None
    publisher: str | None = None
    opencritic_score: int | None = None
    id_opencritic: int | None = None

    # Genres
    genres: list[int]