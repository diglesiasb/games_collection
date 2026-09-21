from fastapi import APIRouter, Query

from ..services.opencritic import search_games, get_game, parse_game, get_platforms, get_genres


router = APIRouter(prefix="/opencritic", tags=["OpenCritic"])


@router.get("/games/search")
def search_opencritic_games(criteria: str = Query(min_length=1)):
    return search_games(criteria)

@router.get("/games/{id_opencritic}")
def get_opencritic_game(id_opencritic: int):
    data = get_game(id_opencritic)

    return parse_game(data)

@router.get("/platforms")
def get_opencritic_platforms():
    return get_platforms()

@router.get("/genres")
def get_opencritic_genres():
    return get_genres()