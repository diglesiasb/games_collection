from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.genre import Genre
from .opencritic import get_genres


def sync_genres(db: Session):
    opencritic_genres = get_genres()
    
    for opencritic_genre in opencritic_genres:
        id_opencritic = opencritic_genre.get("id")
        name = opencritic_genre.get("name")

        result = db.execute(
            select(Genre).where(
                Genre.id_opencritic == id_opencritic
            )
        )

        existing_genre = result.scalar_one_or_none()

        if existing_genre:           
            continue

        genre = Genre(
            genre=name,
            id_opencritic=id_opencritic,            
        )

        db.add(genre)

    db.commit()