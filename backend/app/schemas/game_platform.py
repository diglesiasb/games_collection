from datetime import date
from pydantic import BaseModel


class GamePlatformCreate(BaseModel):
    name: str
    release_date: date
    purchase_date: date | None = None

class GamePlatformUpdate(BaseModel):
    name: str
    release_date: date
    purchase_date: date | None = None

class GamePlatformResponse(BaseModel):
    id_game_platform: int
    name: str
    release_date: date
    purchase_date: date | None
    item_count: int

class GamePlatformSummary(BaseModel):
    id_game_platform: int
    name: str