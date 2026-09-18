from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import engine
from ..models.game import Game
from ..models.game_platform import GamePlatform
from ..models.collection_item import CollectionItem
from ..models.genre import Genre
from ..models.game_genre import GameGenre
from ..schemas.collection_item import (
    CollectionItemCreate,
    CollectionItemUpdate,
    CollectionItemResponse,
    CollectionItemGame,
    CollectionItemPlatform,
)
from ..schemas.collection import CollectionCreate


router = APIRouter(tags=["Collection"])


def get_db():
    with Session(engine) as session:
        yield session


@router.get(
    "/collection-items",
    response_model=list[CollectionItemResponse],
)
def get_collection_items(db: Session = Depends(get_db)):
    result = db.execute(select(CollectionItem))

    collection_items = result.scalars().all()

    return [
        CollectionItemResponse(
            id_collection_item=item.id_collection_item,
            game=CollectionItemGame(
                id_game=item.game.id_game,
                title=item.game.title,
            ),
            platform=CollectionItemPlatform(
                id_game_platform=item.game_platform.id_game_platform,
                name=item.game_platform.name,
            ),
            edition=item.edition,
            type=item.type,
            release_date=item.release_date,
            purchase_date=item.purchase_date,
            starting_date=item.starting_date,
            finish_date=item.finish_date,
            finished=item.finished,
            total_hours=item.total_hours,
        )
        for item in collection_items
    ]


@router.post("/collection-items")
def create_collection_item(
    item: CollectionItemCreate,
    db: Session = Depends(get_db),
):
    new_item = CollectionItem(
        id_game=item.id_game,
        id_game_platform=item.id_game_platform,
        edition=item.edition,
        type=item.type,
        release_date=item.release_date,
        purchase_date=item.purchase_date,
        starting_date=item.starting_date,
        finish_date=item.finish_date,
        finished=item.finished,
        total_hours=item.total_hours,
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


@router.put("/collection-items/{id_collection_item}")
def update_collection_item(
    id_collection_item: int,
    item: CollectionItemUpdate,
    db: Session = Depends(get_db),
):
    existing_item = db.get(
        CollectionItem,
        id_collection_item,
    )

    if existing_item is None:
        raise HTTPException(
            status_code=404,
            detail="Collection item not found",
        )

    existing_item.id_game = item.id_game
    existing_item.id_game_platform = item.id_game_platform
    existing_item.edition = item.edition
    existing_item.type = item.type
    existing_item.release_date = item.release_date
    existing_item.purchase_date = item.purchase_date
    existing_item.starting_date = item.starting_date
    existing_item.finish_date = item.finish_date
    existing_item.finished = item.finished
    existing_item.total_hours = item.total_hours

    db.commit()
    db.refresh(existing_item)

    return existing_item


@router.delete("/collection-items/{id_collection_item}")
def delete_collection_item(
    id_collection_item: int,
    db: Session = Depends(get_db),
):
    item = db.get(
        CollectionItem,
        id_collection_item,
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Collection item not found",
        )

    db.delete(item)
    db.commit()

    return {"message": "Collection item deleted"}


@router.post("/collection")
def create_collection(
    collection: CollectionCreate,
    db: Session = Depends(get_db),
):
    platform = db.get(
        GamePlatform,
        collection.id_game_platform,
    )

    if platform is None:
        raise HTTPException(
            status_code=400,
            detail="Platform does not exist",
        )

    requested_genres = set(collection.genres)

    genres = (
        db.query(Genre)
        .filter(Genre.id_genre.in_(collection.genres))
        .all()
    )

    if len(genres) != len(requested_genres):
        raise HTTPException(
            status_code=400,
            detail="One or more genres do not exist",
        )

    new_game = Game(
        title=collection.title,
        developer=collection.developer,
        publisher=collection.publisher,
        opencritic_score=collection.opencritic_score,
    )

    db.add(new_game)
    db.flush()

    for id_genre in requested_genres:
        game_genre = GameGenre(
            id_game=new_game.id_game,
            id_genre=id_genre,
        )

        db.add(game_genre)

    new_item = CollectionItem(
        id_game=new_game.id_game,
        id_game_platform=collection.id_game_platform,
        edition=collection.edition,
        type=collection.type,
        release_date=collection.release_date,
        purchase_date=collection.purchase_date,
        starting_date=collection.starting_date,
        finish_date=collection.finish_date,
        finished=collection.finished,
        total_hours=collection.total_hours,
    )

    db.add(new_item)
    db.commit()

    db.refresh(new_game)
    db.refresh(new_item)

    return {
        "game": new_game,
        "collection_item": new_item,
    }