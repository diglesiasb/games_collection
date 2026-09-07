from datetime import date
from pydantic import BaseModel

from .collection_item import CollectionItemBase

class CollectionCreate(CollectionItemBase):
    # Game
    title: str
    developer: str
    publisher: str
    opencritic_score: int | None = None

    # Genres
    genres: list[int]