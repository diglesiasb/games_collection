from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import engine
from ..models.genre import Genre
from ..models.game_genre import GameGenre
from ..schemas.genre import GenreCreate, GenreResponse, GenreUpdate
from ..services.opencritic_sync import sync_genres

router = APIRouter(prefix="/genres", tags=["Genres"])


def get_db():
    with Session(engine) as session:
        yield session


@router.get("", response_model=list[GenreResponse])
def get_genres(db: Session = Depends(get_db)):
    result = db.execute(select(Genre).order_by(Genre.genre))

    genres = result.scalars().all()

    return [
        GenreResponse(
            id_genre=genre.id_genre,
            genre=genre.genre,
            game_count=len(genre.games),
            id_opencritic=genre.id_opencritic,          
        )
        for genre in genres
    ]


@router.post("", response_model=GenreResponse)
def create_genre(data: GenreCreate):
    with Session(engine) as session:
        genre = Genre(genre=data.genre)

        session.add(genre)
        session.commit()
        session.refresh(genre)

        return GenreResponse(
            id_genre=genre.id_genre,
            genre=genre.genre,
            game_count=len(genre.games),
            id_opencritic=genre.id_opencritic,           
        )


@router.put("/{id_genre}")
def update_genre(
    id_genre: int,
    genre_data: GenreUpdate,
    db: Session = Depends(get_db),
):
    genre = db.get(Genre, id_genre)

    if genre is None:
        raise HTTPException(status_code=404, detail="Genre not found")

    if genre.id_opencritic is not None:
        raise HTTPException(
            status_code=400,
            detail="OpenCritic genres cannot be edited",
        )

    genre.genre = genre_data.genre

    db.commit()
    db.refresh(genre)

    return genre


@router.delete("/{id_genre}")
def delete_genre(
    id_genre: int,
    db: Session = Depends(get_db),
):
    genre = db.get(Genre, id_genre)

    if genre is None:
        raise HTTPException(status_code=404, detail="Genre not found")

    if genre.id_opencritic is not None:
        raise HTTPException(
            status_code=400,
            detail="OpenCritic genres cannot be deleted",
        )

    game_genres = (
        db.query(GameGenre)
        .filter(GameGenre.id_genre == id_genre)
        .first()
    )

    if game_genres is not None:
        raise HTTPException(
            status_code=400,
            detail="Genre cannot be deleted because it is used by games",
        )

    db.delete(genre)
    db.commit()

    return {"message": "Genre deleted"}


@router.post("/sync-opencritic")
def sync_opencritic_genres(
    db: Session = Depends(get_db),
):
    sync_genres(db)

    return {"message": "Genres synchronized with OpenCritic"}