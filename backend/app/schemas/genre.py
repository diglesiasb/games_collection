from datetime import datetime
from pydantic import BaseModel


class GenreCreate(BaseModel):
    genre: str


class GenreUpdate(BaseModel):
    genre: str


class GenreResponse(BaseModel):
    id_genre: int
    genre: str
    game_count: int
    id_opencritic: int | None