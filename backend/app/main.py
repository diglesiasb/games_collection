from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import FileResponse
from pathlib import Path

from sqlalchemy import text, select
from sqlalchemy.orm import Session

from .database import engine

from .models.game import Game
from .models.game_platform import GamePlatform
from .models.collection_item import CollectionItem

from .schemas.game import (
    GameCreate,
    GameResponse,
    GameCollectionItemResponse,
    GameCollectionItemPlatform,
    GamePlatformResponse
)
from .schemas.game_platform import GamePlatformCreate, GamePlatformUpdate
from .schemas.collection_item import (
    CollectionItemCreate,
    CollectionItemUpdate,
    CollectionItemResponse,
    CollectionItemGame,
    CollectionItemPlatform
)

def get_db():
    with Session(engine) as session:
        yield session

app = FastAPI(
    title="Games Collection API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Games Collection API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.get("/health/db")
def database_health():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": result.scalar_one()
        }
    
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
                    GamePlatformResponse(
                        id_game_platform=item.game_platform.id_game_platform,
                        name=item.game_platform.name
                    )
                )

        result.append(
            GameResponse(
                id_game=game.id_game,
                title=game.title,
                developer=game.developer,
                publisher=game.publisher,
                opencritic_score=game.opencritic_score,
                platforms=platforms,
                collection_items=[]
            )
        )

    return result


@app.post("/games")
def create_game(game: GameCreate, db: Session = Depends(get_db)):
    new_game = Game(
        title=game.title,
        developer=game.developer,
        publisher=game.publisher,
        opencritic_score=game.opencritic_score
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
                GamePlatformResponse(
                    id_game_platform=item.game_platform.id_game_platform,
                    name=item.game_platform.name
                )
            )

    return GameResponse(
        id_game=game.id_game,
        title=game.title,
        developer=game.developer,
        publisher=game.publisher,
        opencritic_score=game.opencritic_score,
        platforms=platforms,
        collection_items=[
            GameCollectionItemResponse(
                id_collection_item=item.id_collection_item,
                platform=GameCollectionItemPlatform(
                    id_game_platform=item.game_platform.id_game_platform,
                    name=item.game_platform.name
                ),
                edition=item.edition,
                type=item.type,
                release_date=item.release_date,
                purchase_date=item.purchase_date,
                starting_date=item.starting_date,
                finish_date=item.finish_date,
                finished=item.finished,
                total_hours=item.total_hours
            )
            for item in game.collection_items
        ]
    )

@app.get("/games/{id_game}/image")
def get_game_image(id_game: int):
    image_path = Path(__file__).resolve().parents[1] / "cache" / "images" / f"{id_game}.jpg"

    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(image_path)

@app.get("/platforms")
def get_platforms(db: Session = Depends(get_db)):
    result = db.execute(
        select(GamePlatform).order_by(GamePlatform.name)
    )
    platforms = result.scalars().all()
    return platforms

@app.post("/platforms")
def create_platform(
    platform: GamePlatformCreate,
    db: Session = Depends(get_db)
):
    new_platform = GamePlatform(
        name=platform.name,
        release_date=platform.release_date
    )

    db.add(new_platform)
    db.commit()
    db.refresh(new_platform)

    return new_platform

@app.put("/platforms/{id_game_platform}")
def update_platform(
    id_game_platform: int,
    platform: GamePlatformUpdate,
    db: Session = Depends(get_db)
):
    existing_platform = db.get(GamePlatform, id_game_platform)

    if existing_platform is None:
        raise HTTPException(status_code=404, detail="Platform not found")

    existing_platform.name = platform.name
    existing_platform.release_date = platform.release_date

    db.commit()
    db.refresh(existing_platform)

    return existing_platform


@app.delete("/platforms/{id_game_platform}")
def delete_platform(
    id_game_platform: int,
    db: Session = Depends(get_db)
):
    platform = db.get(GamePlatform, id_game_platform)

    if platform is None:
        raise HTTPException(status_code=404, detail="Platform not found")

    db.delete(platform)
    db.commit()

    return {"message": "Platform deleted"}

@app.get("/collection-items", response_model=list[CollectionItemResponse])
def get_collection_items(db: Session = Depends(get_db)):
    result = db.execute(
        select(CollectionItem)
    )

    collection_items = result.scalars().all()

    return [
        CollectionItemResponse(
            id_collection_item=item.id_collection_item,
            game=CollectionItemGame(
                id_game=item.game.id_game,
                title=item.game.title
            ),
            platform=CollectionItemPlatform(
                id_game_platform=item.game_platform.id_game_platform,
                name=item.game_platform.name
            ),
            edition=item.edition,
            type=item.type,
            release_date=item.release_date,
            purchase_date=item.purchase_date,
            starting_date=item.starting_date,
            finish_date=item.finish_date,
            finished=item.finished,
            total_hours=item.total_hours
        )
        for item in collection_items
    ]


@app.post("/collection-items")
def create_collection_item(
    item: CollectionItemCreate,
    db: Session = Depends(get_db)
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
        total_hours=item.total_hours
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item

@app.put("/collection-items/{id_collection_item}")
def update_collection_item(
    id_collection_item: int,
    item: CollectionItemUpdate,
    db: Session = Depends(get_db)
):
    existing_item = db.get(CollectionItem, id_collection_item)

    if existing_item is None:
        raise HTTPException(
            status_code=404,
            detail="Collection item not found"
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


@app.delete("/collection-items/{id_collection_item}")
def delete_collection_item(
    id_collection_item: int,
    db: Session = Depends(get_db)
):
    item = db.get(CollectionItem, id_collection_item)

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Collection item not found"
        )

    db.delete(item)
    db.commit()

    return {"message": "Collection item deleted"}