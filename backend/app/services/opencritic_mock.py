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
    12346: "score-null.json",
    12347: "no-genres.json",
    12348: "no-developer.json",
    12349: "no-publisher.json",
    12350: "no-companies.json",
    12351: "no-platforms.json",
    12352: "platforms-without-release-date.json",
    12353: "masthead-partial.json",
    12354: "masthead-only-sm.json",
    12355: "no-masthead.json",
    12356: "no-images.json",
    12357: "minimal-game.json",
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