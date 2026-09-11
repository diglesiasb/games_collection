from datetime import date
from typing import Literal

from pydantic import BaseModel, model_validator


class CollectionItemBase(BaseModel):
    id_game_platform: int
    edition: str
    type: Literal["Physical", "Digital"]
    release_date: date
    purchase_date: date | None = None
    starting_date: date | None = None
    finish_date: date | None = None
    finished: bool = False
    total_hours: int | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.total_hours is not None and self.total_hours < 0:
            raise ValueError(
                "total_hours must be greater than or equal to 0"
            )

        if (
            self.starting_date is not None
            and self.starting_date < self.release_date
        ):
            raise ValueError(
                "starting_date cannot be before release_date"
            )

        if (
            self.finish_date is not None
            and self.finish_date < self.release_date
        ):
            raise ValueError(
                "finish_date cannot be before release_date"
            )

        if (
            self.starting_date is not None
            and self.finish_date is not None
            and self.finish_date < self.starting_date
        ):
            raise ValueError(
                "finish_date cannot be before starting_date"
            )

        if not self.finished and self.finish_date is not None:
            raise ValueError(
                "finish_date must be null when finished is false"
            )

        return self
    

class CollectionItemCreate(CollectionItemBase):
    id_game: int


class CollectionItemUpdate(CollectionItemBase):
    id_game: int


class CollectionItemGame(BaseModel):
    id_game: int
    title: str


class CollectionItemPlatform(BaseModel):
    id_game_platform: int
    name: str


class CollectionItemResponse(BaseModel):
    id_collection_item: int
    game: CollectionItemGame
    platform: CollectionItemPlatform
    edition: str
    type: str
    release_date: date
    purchase_date: date | None
    starting_date: date | None
    finish_date: date | None
    finished: bool
    total_hours: int | None

class CollectionItemForGameCreate(CollectionItemBase):
    pass

class CollectionItemCreateForGame(CollectionItemBase):
    pass