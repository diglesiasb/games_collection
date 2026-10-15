from pathlib import Path

from datetime import datetime, timezone

import httpx
from fastapi import Body
from sqlalchemy.exc import IntegrityError

from ..services.opencritic import get_game as get_opencritic_game
from ..services.opencritic import parse_game

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import engine
from ..models.game import Game
from ..models.game_platform import GamePlatform
from ..models.collection_item import CollectionItem
from ..models.genre import Genre
from ..models.game_genre import GameGenre
from ..schemas.game import (
    GameCreate,
    GameUpdate,
    GameGenreResponse,
    GameResponse,
    GameCollectionItemResponse,
    GameCollectionItemPlatform,
)
from ..schemas.game_platform import GamePlatformSummary
from ..schemas.collection_item import CollectionItemBase

router = APIRouter(prefix="/games", tags=["Games"])


def get_db():
    with Session(engine) as session:
        yield session


def sync_game_with_opencritic(
    game: Game,
    id_opencritic: int,
    db: Session,
):
    # Prevent linking an OpenCritic game already linked elsewhere.
    existing_game = db.scalar(
        select(Game).where(
            Game.id_opencritic == id_opencritic,
            Game.id_game != game.id_game,
        )
    )

    if existing_game is not None:
        raise HTTPException(
            status_code=409,
            detail="This OpenCritic game is already linked to another game",
        )

    # Retrieve the latest OpenCritic data.
    try:
        raw_data = get_opencritic_game(id_opencritic, db)
        opencritic_data = parse_game(raw_data)
    except (httpx.HTTPError, RuntimeError, ValueError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not retrieve game data from OpenCritic",
        ) from exc

    if opencritic_data.get("id_opencritic") != id_opencritic:
        raise HTTPException(
            status_code=502,
            detail="OpenCritic returned an unexpected game",
        )

    # Fill developer and publisher only when currently empty.
    if not game.developer or not game.developer.strip():
        game.developer = opencritic_data["developer"]

    if not game.publisher or not game.publisher.strip():
        game.publisher = opencritic_data["publisher"]

    # Add locally synchronized genres without removing existing ones.
    opencritic_genre_ids = {
        genre["id_opencritic"]
        for genre in opencritic_data["genres"]
        if genre.get("id_opencritic") is not None
    }

    existing_genre_ids = {genre.id_genre for genre in game.genres}

    if opencritic_genre_ids:
        local_genres = db.scalars(
            select(Genre).where(Genre.id_opencritic.in_(opencritic_genre_ids))
        ).all()

        for genre in local_genres:
            if genre.id_genre not in existing_genre_ids:
                game.genres.append(genre)
                existing_genre_ids.add(genre.id_genre)

    # OpenCritic controls the score, including when it is null.
    game.id_opencritic = id_opencritic
    game.opencritic_score = opencritic_data["opencritic_score"]
    game.opencritic_updated_at = datetime.now(timezone.utc)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This OpenCritic game is already linked to another game",
        ) from exc

    db.refresh(game)

    # Download and overwrite the local game image from OpenCritic.
    image_url = opencritic_data.get("image")

    if image_url:
        try:
            response = httpx.get(image_url, timeout=15.0)
            response.raise_for_status()

            image_path = (
                Path(__file__).resolve().parents[1]
                / "cache"
                / "images"
                / f"{game.id_game}.jpg"
            )

            image_path.parent.mkdir(parents=True, exist_ok=True)
            image_path.write_bytes(response.content)

        except (httpx.HTTPError, OSError):
            pass

    return {
        "message": "Game synchronized with OpenCritic",
        "id_opencritic": game.id_opencritic,
        "opencritic_score": game.opencritic_score,
        "opencritic_updated_at": game.opencritic_updated_at,
    }


@router.get("", response_model=list[GameResponse])
def get_games(db: Session = Depends(get_db)):
    result = db.execute(select(Game))
    games = result.scalars().all()

    result = []

    for game in games:
        platforms = []
        platform_ids = set()

        for item in game.collection_items:
            if item.id_game_platform not in platform_ids:
                platform_ids.add(item.id_game_platform)

                platforms.append(
                    GamePlatformSummary(
                        id_game_platform=item.game_platform.id_game_platform,
                        name=item.game_platform.name,
                    )
                )

        genres = [
            GameGenreResponse(
                id_genre=genre.id_genre,
                genre=genre.genre,
            )
            for genre in game.genres
        ]

        collection_items = [
            GameCollectionItemResponse(
                id_collection_item=item.id_collection_item,
                platform=GameCollectionItemPlatform(
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
            for item in game.collection_items
        ]

        result.append(
            GameResponse(
                id_game=game.id_game,
                title=game.title,
                developer=game.developer,
                publisher=game.publisher,
                opencritic_score=game.opencritic_score,
                genres=genres,
                platforms=platforms,
                collection_items=collection_items,
                id_opencritic=game.id_opencritic,
                opencritic_updated_at=game.opencritic_updated_at,
            )
        )

    return result


@router.post("")
def create_game(game: GameCreate, db: Session = Depends(get_db)):
    new_game = Game(
        title=game.title,
        developer=game.developer,
        publisher=game.publisher,
    )

    db.add(new_game)
    db.commit()
    db.refresh(new_game)

    return new_game


@router.get("/{id_game}", response_model=GameResponse)
def get_game(id_game: int, db: Session = Depends(get_db)):
    game = db.get(Game, id_game)

    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    platforms = []
    platform_ids = set()

    for item in game.collection_items:
        if item.id_game_platform not in platform_ids:
            platform_ids.add(item.id_game_platform)

            platforms.append(
                GamePlatformSummary(
                    id_game_platform=item.game_platform.id_game_platform,
                    name=item.game_platform.name,
                )
            )

    genres = [
        GameGenreResponse(
            id_genre=genre.id_genre,
            genre=genre.genre,
        )
        for genre in game.genres
    ]

    return GameResponse(
        id_game=game.id_game,
        title=game.title,
        developer=game.developer,
        publisher=game.publisher,
        genres=genres,
        opencritic_score=game.opencritic_score,
        id_opencritic=game.id_opencritic,
        opencritic_updated_at=game.opencritic_updated_at,
        platforms=platforms,
        collection_items=[
            GameCollectionItemResponse(
                id_collection_item=item.id_collection_item,
                platform=GameCollectionItemPlatform(
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
            for item in game.collection_items
        ],
    )


@router.put("/{id_game}")
def update_game(
    id_game: int,
    game_data: GameUpdate,
    db: Session = Depends(get_db),
):
    game = db.get(Game, id_game)

    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    requested_genres = set(game_data.genres)

    genres = db.query(Genre).filter(Genre.id_genre.in_(requested_genres)).all()

    if len(genres) != len(requested_genres):
        raise HTTPException(
            status_code=400,
            detail="One or more genres do not exist",
        )

    game.title = game_data.title
    game.developer = game_data.developer
    game.publisher = game_data.publisher

    db.query(GameGenre).filter(GameGenre.id_game == id_game).delete()

    for id_genre in requested_genres:
        game_genre = GameGenre(
            id_game=id_game,
            id_genre=id_genre,
        )
        db.add(game_genre)

    db.commit()
    db.refresh(game)

    return game


@router.post("/{id_game}/link-opencritic")
def link_opencritic(
    id_game: int,
    id_opencritic: int = Body(embed=True),
    db: Session = Depends(get_db),
):
    game = db.get(Game, id_game)

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    return sync_game_with_opencritic(
        game,
        id_opencritic,
        db,
    )


@router.post("/{id_game}/unlink-opencritic")
def unlink_opencritic(
    id_game: int,
    db: Session = Depends(get_db),
):
    game = db.get(Game, id_game)

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    game.id_opencritic = None
    game.opencritic_score = None
    game.opencritic_updated_at = None

    db.commit()

    return {"message": "OpenCritic unlinked successfully"}


@router.post("/{id_game}/update-opencritic")
def update_opencritic(
    id_game: int,
    db: Session = Depends(get_db),
):
    game = db.get(Game, id_game)

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    if game.id_opencritic is None:
        raise HTTPException(
            status_code=400,
            detail="Game is not linked to OpenCritic",
        )

    return sync_game_with_opencritic(
        game,
        game.id_opencritic,
        db,
    )


@router.delete("/{id_game}")
def delete_game(id_game: int, db: Session = Depends(get_db)):
    game = db.get(Game, id_game)

    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    db.query(GameGenre).filter(GameGenre.id_game == id_game).delete()

    db.query(CollectionItem).filter(CollectionItem.id_game == id_game).delete()

    db.delete(game)

    db.commit()

    image_path = (
        Path(__file__).resolve().parents[1] / "cache" / "images" / f"{id_game}.jpg"
    )

    if image_path.exists():
        image_path.unlink()

    return {"message": "Game deleted"}


@router.get("/{id_game}/image")
def get_game_image(id_game: int):
    image_path = (
        Path(__file__).resolve().parents[1] / "cache" / "images" / f"{id_game}.jpg"
    )

    if not image_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Image not found",
        )

    return FileResponse(image_path)


@router.post("/{id_game}/collection-items")
def create_game_collection_item(
    id_game: int,
    item: CollectionItemBase,
    db: Session = Depends(get_db),
):
    game = db.get(Game, id_game)

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    platform = db.get(
        GamePlatform,
        item.id_game_platform,
    )

    if platform is None:
        raise HTTPException(
            status_code=400,
            detail="Platform does not exist",
        )

    new_item = CollectionItem(
        id_game=id_game,
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
