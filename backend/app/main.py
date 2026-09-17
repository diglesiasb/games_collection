from sys import platform

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import FileResponse
from pathlib import Path

from sqlalchemy import text, select
from sqlalchemy.orm import Session

from .database import engine

from .models.game import Game
from .models.game_platform import GamePlatform
from .models.collection_item import CollectionItem
from .models.genre import Genre
from .models.game_genre import GameGenre

from .schemas.game import (
    GameCreate,
    GameUpdate,
    GameGenreResponse,
    GameResponse,
    GameCollectionItemResponse,
    GameCollectionItemPlatform
)
from .schemas.game_platform import GamePlatformCreate, GamePlatformUpdate, GamePlatformResponse, GamePlatformSummary
from .schemas.collection_item import (
    CollectionItemBase,
    CollectionItemCreate,
    CollectionItemUpdate,
    CollectionItemResponse,
    CollectionItemGame,
    CollectionItemPlatform,
)

from .schemas.genre import GenreCreate, GenreResponse, GenreUpdate
from .schemas.collection import CollectionCreate
from app.schemas import collection


def get_db():
    with Session(engine) as session:
        yield session


app = FastAPI(title="Games Collection API", version="0.1.0", docs_url=None)


@app.get("/swagger-dark.css", include_in_schema=False)
def swagger_dark_css():
    return FileResponse("app/swagger-dark.css")


@app.get("/docs", include_in_schema=False)
def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - Swagger UI",
        swagger_css_url="/swagger-dark.css",
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://192.168.0.54:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Games Collection API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/db")
def database_health():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {"status": "ok", "database": result.scalar_one()}


@app.get("/games", response_model=list[GameResponse])
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
            GameGenreResponse(id_genre=genre.id_genre, genre=genre.genre)
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
            )
        )

    return result


@app.post("/games")
def create_game(game: GameCreate, db: Session = Depends(get_db)):
    new_game = Game(
        title=game.title,
        developer=game.developer,
        publisher=game.publisher,
        opencritic_score=game.opencritic_score,
    )

    db.add(new_game)
    db.commit()
    db.refresh(new_game)

    return new_game


@app.get("/games/{id_game}", response_model=GameResponse)
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
        GameGenreResponse(id_genre=genre.id_genre, genre=genre.genre)
        for genre in game.genres
    ]

    return GameResponse(
        id_game=game.id_game,
        title=game.title,
        developer=game.developer,
        publisher=game.publisher,
        genres=genres,
        opencritic_score=game.opencritic_score,
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


@app.put("/games/{id_game}")
def update_game(id_game: int, game_data: GameUpdate, db: Session = Depends(get_db)):
    game = db.get(Game, id_game)

    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    requested_genres = set(game_data.genres)

    genres = db.query(Genre).filter(Genre.id_genre.in_(requested_genres)).all()

    if len(genres) != len(requested_genres):
        raise HTTPException(status_code=400, detail="One or more genres do not exist")

    game.title = game_data.title
    game.developer = game_data.developer
    game.publisher = game_data.publisher
    game.opencritic_score = game_data.opencritic_score

    db.query(GameGenre).filter(GameGenre.id_game == id_game).delete()

    for id_genre in requested_genres:
        game_genre = GameGenre(id_game=id_game, id_genre=id_genre)
        db.add(game_genre)

    db.commit()
    db.refresh(game)

    return game


@app.delete("/games/{id_game}")
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


@app.get("/games/{id_game}/image")
def get_game_image(id_game: int):
    image_path = (
        Path(__file__).resolve().parents[1] / "cache" / "images" / f"{id_game}.jpg"
    )

    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(image_path)


@app.post("/games/{id_game}/collection-items")
def create_game_collection_item(
    id_game: int, item: CollectionItemBase, db: Session = Depends(get_db)
):
    game = db.get(Game, id_game)

    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    platform = db.get(GamePlatform, item.id_game_platform)

    if platform is None:
        raise HTTPException(status_code=400, detail="Platform does not exist")

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


@app.get("/platforms", response_model=list[GamePlatformResponse])
def get_platforms(db: Session = Depends(get_db)):

    result = db.execute(
        select(GamePlatform).order_by(GamePlatform.name)
    )

    platforms = result.scalars().all()

    return [
        GamePlatformResponse(
            id_game_platform=platform.id_game_platform,
            name=platform.name,
            release_date=platform.release_date,
            purchase_date=platform.purchase_date,
            item_count=len(platform.collection_items)
        )
        for platform in platforms
    ]


@app.post("/platforms")
def create_platform(platform: GamePlatformCreate, db: Session = Depends(get_db)):
    new_platform = GamePlatform(name=platform.name, release_date=platform.release_date, purchase_date=platform.purchase_date)

    db.add(new_platform)
    db.commit()
    db.refresh(new_platform)

    return new_platform


@app.put("/platforms/{id_game_platform}")
def update_platform(
    id_game_platform: int, platform: GamePlatformUpdate, db: Session = Depends(get_db)
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


@app.delete("/platforms/{id_game_platform}")
def delete_platform(id_game_platform: int, db: Session = Depends(get_db)):
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


@app.get("/collection-items", response_model=list[CollectionItemResponse])
def get_collection_items(db: Session = Depends(get_db)):
    result = db.execute(select(CollectionItem))

    collection_items = result.scalars().all()

    return [
        CollectionItemResponse(
            id_collection_item=item.id_collection_item,
            game=CollectionItemGame(id_game=item.game.id_game, title=item.game.title),
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


@app.post("/collection-items")
def create_collection_item(item: CollectionItemCreate, db: Session = Depends(get_db)):
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


@app.put("/collection-items/{id_collection_item}")
def update_collection_item(
    id_collection_item: int, item: CollectionItemUpdate, db: Session = Depends(get_db)
):
    existing_item = db.get(CollectionItem, id_collection_item)

    if existing_item is None:
        raise HTTPException(status_code=404, detail="Collection item not found")

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


@app.delete("/collection-items/{id_collection_item}")
def delete_collection_item(id_collection_item: int, db: Session = Depends(get_db)):
    item = db.get(CollectionItem, id_collection_item)

    if item is None:
        raise HTTPException(status_code=404, detail="Collection item not found")

    db.delete(item)
    db.commit()

    return {"message": "Collection item deleted"}


@app.get("/genres", response_model=list[GenreResponse])
def get_genres():
    with Session(engine) as session:
        genres = session.query(Genre).order_by(Genre.genre).all()
        return genres


@app.post("/genres", response_model=GenreResponse)
def create_genre(data: GenreCreate):
    with Session(engine) as session:
        genre = Genre(genre=data.genre)

        session.add(genre)
        session.commit()
        session.refresh(genre)

        return genre


@app.put("/genres/{id_genre}")
def update_genre(id_genre: int, genre_data: GenreUpdate, db: Session = Depends(get_db)):
    genre = db.get(Genre, id_genre)

    if genre is None:
        raise HTTPException(status_code=404, detail="Genre not found")

    genre.genre = genre_data.genre

    db.commit()
    db.refresh(genre)

    return genre


@app.delete("/genres/{id_genre}")
def delete_genre(id_genre: int, db: Session = Depends(get_db)):
    genre = db.get(Genre, id_genre)

    if genre is None:
        raise HTTPException(status_code=404, detail="Genre not found")

    game_genres = db.query(GameGenre).filter(GameGenre.id_genre == id_genre).first()

    if game_genres is not None:
        raise HTTPException(
            status_code=400,
            detail="Genre cannot be deleted because it is used by games",
        )

    db.delete(genre)
    db.commit()

    return {"message": "Genre deleted"}


@app.post("/collection")
def create_collection(collection: CollectionCreate, db: Session = Depends(get_db)):

    platform = db.get(GamePlatform, collection.id_game_platform)

    if platform is None:
        raise HTTPException(status_code=400, detail="Platform does not exist")

    requested_genres = set(collection.genres)

    genres = db.query(Genre).filter(Genre.id_genre.in_(collection.genres)).all()

    if len(genres) != len(requested_genres):
        raise HTTPException(status_code=400, detail="One or more genres do not exist")

    new_game = Game(
        title=collection.title,
        developer=collection.developer,
        publisher=collection.publisher,
        opencritic_score=collection.opencritic_score,
    )

    db.add(new_game)
    db.flush()

    for id_genre in requested_genres:
        game_genre = GameGenre(id_game=new_game.id_game, id_genre=id_genre)

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

    return {"game": new_game, "collection_item": new_item}
