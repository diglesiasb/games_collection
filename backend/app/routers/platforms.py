from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import engine
from ..models.game_platform import GamePlatform
from ..models.collection_item import CollectionItem
from ..schemas.game_platform import (
    GamePlatformCreate,
    GamePlatformUpdate,
    GamePlatformResponse,
)


router = APIRouter(prefix="/platforms", tags=["Platforms"])


def get_db():
    with Session(engine) as session:
        yield session


@router.get("", response_model=list[GamePlatformResponse])
def get_platforms(db: Session = Depends(get_db)):
    result = db.execute(select(GamePlatform).order_by(GamePlatform.name))

    platforms = result.scalars().all()

    return [
        GamePlatformResponse(
            id_game_platform=platform.id_game_platform,
            name=platform.name,
            release_date=platform.release_date,
            purchase_date=platform.purchase_date,
            item_count=len(platform.collection_items),
            id_opencritic=platform.id_opencritic,
            opencritic_updated_at=platform.opencritic_updated_at,
        )
        for platform in platforms
    ]


@router.post("")
def create_platform(
    platform: GamePlatformCreate,
    db: Session = Depends(get_db),
):
    new_platform = GamePlatform(
        name=platform.name,
        release_date=platform.release_date,
        purchase_date=platform.purchase_date,
    )

    db.add(new_platform)
    db.commit()
    db.refresh(new_platform)

    return new_platform


@router.put("/{id_game_platform}")
def update_platform(
    id_game_platform: int,
    platform: GamePlatformUpdate,
    db: Session = Depends(get_db),
):
    existing_platform = db.get(GamePlatform, id_game_platform)

    if existing_platform is None:
        raise HTTPException(status_code=404, detail="Platform not found")

    existing_platform.name = platform.name
    existing_platform.release_date = platform.release_date
    existing_platform.purchase_date = platform.purchase_date

    db.commit()
    db.refresh(existing_platform)

    return existing_platform


@router.delete("/{id_game_platform}")
def delete_platform(
    id_game_platform: int,
    db: Session = Depends(get_db),
):
    platform = db.get(GamePlatform, id_game_platform)

    if platform is None:
        raise HTTPException(status_code=404, detail="Platform not found")

    collection_items = (
        db.query(CollectionItem)
        .filter(CollectionItem.id_game_platform == id_game_platform)
        .first()
    )

    if collection_items is not None:
        raise HTTPException(
            status_code=400,
            detail="Platform cannot be deleted because it is used by collection items",
        )

    db.delete(platform)
    db.commit()

    return {"message": "Platform deleted"}