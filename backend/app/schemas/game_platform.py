from datetime import date, datetime
from pydantic import BaseModel


class GamePlatformCreate(BaseModel):
    name: str
    release_date: date | None = None
    purchase_date: date | None = None

class GamePlatformUpdate(BaseModel):
    name: str
    release_date: date | None = None
    purchase_date: date | None = None

class GamePlatformResponse(BaseModel):
    id_game_platform: int
    name: str
    release_date: date | None
    purchase_date: date | None
    id_opencritic: int | None
    item_count: int

class GamePlatformSummary(BaseModel):
    id_game_platform: int
    name: str    

class PlatformOpenCriticLink(BaseModel):
    id_opencritic: int