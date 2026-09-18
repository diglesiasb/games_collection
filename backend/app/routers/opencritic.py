from fastapi import APIRouter, Query

from ..services.opencritic import search_games, get_game


router = APIRouter(prefix="/opencritic", tags=["OpenCritic"])


@router.get("/games/search")
def search_opencritic_games(criteria: str = Query(min_length=1)):
    return search_games(criteria)

@router.get("/games/{id_opencritic}")
def get_opencritic_game(id_opencritic: int):
    return get_game(id_opencritic)