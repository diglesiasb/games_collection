import json
from pathlib import Path


BASE_PATH = (
    Path(__file__).resolve().parent.parent
    / "mocks"
    / "opencritic"
)

GAME_FIXTURES = {
    463: "witcher3.json",
    12345: "score-minus-one.json",
    12346: "no-developer.json",
    12347: "no-genres.json",
}


def search_games(criteria: str):
    with open(
        BASE_PATH / "search.json",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def get_game(id_opencritic: int):

    filename = GAME_FIXTURES[id_opencritic]

    with open(
        BASE_PATH / "games" / filename,
        encoding="utf-8"
    ) as file:

        return json.load(file)