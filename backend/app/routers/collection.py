import httpx
import re

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pathlib import Path

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
        id_opencritic=collection.id_opencritic,
        opencritic_updated_at=(
            datetime.now(timezone.utc)
            if collection.id_opencritic is not None
            else None
        ),  
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

    if collection.image:
        image_path = (
            Path(__file__).resolve().parents[1]
            / "cache"
            / "images"
            / f"{new_game.id_game}.jpg"
        )

        try:
            response = httpx.get(
                collection.image,
                timeout=10.0,
            )
            response.raise_for_status()

            image_path.parent.mkdir(parents=True, exist_ok=True)
            image_path.write_bytes(response.content)

        except httpx.HTTPError:
            pass




    return {
        "game": new_game,
        "collection_item": new_item,
    }



@router.post("/collection-import/preview")
async def preview_collection_import(
    id_game_platform: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Validate platform
    platform = db.get(GamePlatform, id_game_platform)

    if platform is None:
        raise HTTPException(
            status_code=400,
            detail="Platform does not exist",
        )

    # Read text file
    content = await file.read()

    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="The file must be a UTF-8 text file",
        )

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="The file is empty",
        )

    items = []
    seen_titles = set()

    for line_number, raw_line in enumerate(text.splitlines(), start=1):
        line = raw_line.strip()

        # Ignore blank lines
        if not line:
            continue

        # An asterisk at the end means finished
        finished = line.endswith("*")

        if finished:
            line = line[:-1].strip()

        if not line:
            raise HTTPException(
                status_code=400,
                detail=f"Empty title on line {line_number}",
            )

        normalized_title = line.casefold()

        # Detect repeated titles within the uploaded file
        if normalized_title in seen_titles:
            items.append({
                "title": line,
                "finished": finished,
                "status": "duplicate_in_file",
                "reason": "This title already appears in the file",
                "id_game": None,
                "line_number": line_number,
            })
            continue

        seen_titles.add(normalized_title)

        # Find an existing game by exact title,
        # ignoring case and surrounding whitespace
        game = db.execute(
            select(Game).where(
                func.lower(func.trim(Game.title))
                == line.lower()
            )
        ).scalars().first()

        if game is None:
            status = "new_game"
            reason = "A new game and collection item will be created"

        else:
            collection_item = db.execute(
                select(CollectionItem).where(
                    CollectionItem.id_game == game.id_game,
                    CollectionItem.id_game_platform == id_game_platform,
                )
            ).scalars().first()

            if collection_item is not None:
                status = "already_in_collection"
                reason = "This game is already in the selected platform"
            else:
                status = "add_to_collection"
                reason = "The game exists and will be added to the collection"

        items.append({
            "title": line,
            "finished": finished,
            "status": status,
            "reason": reason,
            "id_game": game.id_game if game else None,
            "line_number": line_number,
        })

    summary = {
        "total": len(items),
        "new_games": sum(
            item["status"] == "new_game" for item in items
        ),
        "add_to_collection": sum(
            item["status"] == "add_to_collection" for item in items
        ),
        "already_in_collection": sum(
            item["status"] == "already_in_collection" for item in items
        ),
        "duplicate_in_file": sum(
            item["status"] == "duplicate_in_file" for item in items
        ),
    }

    return {
        "id_game_platform": platform.id_game_platform,
        "platform_name": platform.name,
        "summary": summary,
        "items": items,
    }


@router.post("/collection-import/import")
async def import_collection_games(
    id_game_platform: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Validate platform
    platform = db.get(GamePlatform, id_game_platform)

    if platform is None:
        raise HTTPException(
            status_code=400,
            detail="Platform does not exist",
        )

    # Read text file
    content = await file.read()

    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="The file must be a UTF-8 text file",
        )

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="The file is empty",
        )

    items = []
    seen_titles = set()

    summary = {
        "total": 0,
        "new_games": 0,
        "add_to_collection": 0,
        "already_in_collection": 0,
        "duplicate_in_file": 0,
    }

    try:
        for line_number, raw_line in enumerate(
            text.splitlines(), start=1
        ):
            line = raw_line.strip()

            # Ignore blank lines
            if not line:
                continue

            # An asterisk at the end means finished
            finished = line.endswith("*")

            if finished:
                line = line[:-1].strip()

            if not line:
                raise HTTPException(
                    status_code=400,
                    detail=f"Empty title on line {line_number}",
                )

            normalized_title = line.casefold()

            # Detect repeated titles within the uploaded file
            if normalized_title in seen_titles:
                summary["duplicate_in_file"] += 1
                summary["total"] += 1

                items.append({
                    "title": line,
                    "finished": finished,
                    "status": "duplicate_in_file",
                    "line_number": line_number,
                })
                continue

            seen_titles.add(normalized_title)

            # Find an existing game by exact title
            game = db.execute(
                select(Game).where(
                    func.lower(func.trim(Game.title))
                    == line.lower()
                )
            ).scalars().first()

            if game is None:
                game = Game(title=line)
                db.add(game)
                db.flush()

                status = "new_game"
                summary["new_games"] += 1

            else:
                collection_item = db.execute(
                    select(CollectionItem).where(
                        CollectionItem.id_game == game.id_game,
                        CollectionItem.id_game_platform
                        == id_game_platform,
                    )
                ).scalars().first()

                if collection_item is not None:
                    status = "already_in_collection"
                    summary["already_in_collection"] += 1

                    summary["total"] += 1
                    items.append({
                        "title": line,
                        "finished": finished,
                        "status": status,
                        "id_game": game.id_game,
                        "line_number": line_number,
                    })
                    continue

                status = "add_to_collection"
                summary["add_to_collection"] += 1

            # Create the collection entry
            collection_item = CollectionItem(
                id_game=game.id_game,
                id_game_platform=id_game_platform,
                edition="Standard",
                type="Physical",
                release_date=date(1900, 1, 1),
                finished=finished,
                finish_date=None,
            )

            db.add(collection_item)

            summary["total"] += 1

            items.append({
                "title": line,
                "finished": finished,
                "status": status,
                "id_game": game.id_game,
                "line_number": line_number,
            })

        # Commit everything together
        db.commit()

    except HTTPException:
        db.rollback()
        raise

    except Exception as exc:
        db.rollback()
        print(f"Error importing collection games: {exc}")

        raise HTTPException(
            status_code=500,
            detail="An error occurred while importing the games",
        )

    return {
        "id_game_platform": platform.id_game_platform,
        "platform_name": platform.name,
        "summary": summary,
        "items": items,
    }