from fastapi import APIRouter, Query, Depends
from ..database import engine
from sqlalchemy.orm import Session

from ..services.opencritic import (
    search_games,
    get_game,
    parse_game,
    get_platforms,
    get_genres,
)

from ..services.opencritic_usage import get_usage

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
def get_opencritic_platforms(
    db: Session = Depends(get_db),
):
    return get_platforms(db)


@router.get("/genres")
def get_opencritic_genres(
    db: Session = Depends(get_db),
):
    return get_genres(db)


@router.get("/status")
def get_opencritic_status(
    db: Session = Depends(get_db),
):
    usage = get_usage(db)

    if usage is None:
        raise RuntimeError("OpenCritic usage row not found")

    return {
        "searches_limit": usage.searches_limit,
        "searches_remaining": usage.searches_remaining,
        "searches_reset_at": usage.searches_reset_at,
        "requests_limit": usage.requests_limit,
        "requests_remaining": usage.requests_remaining,
        "requests_reset_at": usage.requests_reset_at,
        "updated_at": usage.updated_at,
    }
