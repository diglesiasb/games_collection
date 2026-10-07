from fastapi import APIRouter, Query, Depends
from ..database import engine
from sqlalchemy.orm import Session

from ..services.opencritic import search_games, get_game, parse_game, get_platforms, get_genres, OPENCRITIC_USAGE

router = APIRouter(prefix="/opencritic", tags=["OpenCritic"])

def get_db():
    with Session(engine) as session:
        yield session

@router.get("/games/search")
def search_opencritic_games(
    criteria: str = Query(min_length=1),
    db: Session = Depends(get_db),
):
    return search_games(criteria, db)


@router.get("/games/{id_opencritic}")
def get_opencritic_game(
    id_opencritic: int,
    db: Session = Depends(get_db),
):
    data = get_game(id_opencritic, db)

    return parse_game(data)

@router.get("/platforms")
def get_opencritic_platforms():
    return get_platforms()

@router.get("/genres")
def get_opencritic_genres():
    return get_genres()

@router.get("/status")
def get_opencritic_status():
    return OPENCRITIC_USAGE
