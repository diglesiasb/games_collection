from datetime import date
from pydantic import BaseModel


class GamePlatformCreate(BaseModel):
    name: str
    release_date: date


class GamePlatformUpdate(BaseModel):
    name: str
    release_date: date