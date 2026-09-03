from pydantic import BaseModel


class GameCreate(BaseModel):
    title: str
    developer: str
    publisher: str
    opencritic_score: int | None = None