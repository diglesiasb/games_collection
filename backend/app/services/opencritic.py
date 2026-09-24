import os

import httpx
from dotenv import load_dotenv

from datetime import datetime

load_dotenv()

USE_MOCK = os.getenv("OPENCRITIC_MOCK", "false").lower() == "true"

print("OPENCRITIC_MOCK =", USE_MOCK)

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST")


def search_games(criteria: str):

    if USE_MOCK:
        from .opencritic_mock import search_games as mock_search_games
        return mock_search_games(criteria)

    if not RAPIDAPI_KEY:
        raise RuntimeError("RAPIDAPI_KEY is not configured")

    if not RAPIDAPI_HOST:
        raise RuntimeError("RAPIDAPI_HOST is not configured")

    url = f"https://{RAPIDAPI_HOST}/game/search"

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/json",
    }

    response = httpx.get(
        url,
        headers=headers,
        params={"criteria": criteria},
    )

    response.raise_for_status()

    return response.json()

def get_game(id_opencritic: int):

    if USE_MOCK:
        from .opencritic_mock import get_game as mock_get_game
        return mock_get_game(id_opencritic)

    if not RAPIDAPI_KEY:
        raise RuntimeError("RAPIDAPI_KEY is not configured")

    if not RAPIDAPI_HOST:
        raise RuntimeError("RAPIDAPI_HOST is not configured")

    url = f"https://{RAPIDAPI_HOST}/game/{id_opencritic}"

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/json",
    }

    response = httpx.get(
        url,
        headers=headers,
    )

    response.raise_for_status()

    return response.json()

def parse_game(data: dict):
    developer = None
    publisher = None

    for company in data.get("Companies", []):
        if company.get("type") == "DEVELOPER":
            developer = company.get("name")

        elif company.get("type") == "PUBLISHER":
            publisher = company.get("name")

    genres = [
        {
            "id_opencritic": genre.get("id"),
            "name": genre.get("name"),
        }
        for genre in data.get("Genres", [])
    ]

    platforms = [
        {
            "id_opencritic": platform.get("id"),
            "name": platform.get("name"),
            "release_date": (
                datetime.fromisoformat(
                    platform["releaseDate"].replace("Z", "+00:00")
                ).date()
                if platform.get("releaseDate")
                else None
            ),
        }
        for platform in data.get("Platforms", [])
    ]

    return {
        "id_opencritic": data.get("id"),
        "title": data.get("name"),
        "developer": developer,
        "publisher": publisher,
        "opencritic_score": data.get("medianScore"),
        "genres": genres,
        "platforms": platforms,
    }

def get_platforms():
    if not RAPIDAPI_KEY:
        raise RuntimeError("RAPIDAPI_KEY is not configured")

    if not RAPIDAPI_HOST:
        raise RuntimeError("RAPIDAPI_HOST is not configured")

    url = f"https://{RAPIDAPI_HOST}/platform"

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/json",
    }

    response = httpx.get(
        url,
        headers=headers,
    )

    response.raise_for_status()

    return response.json()

def get_genres():
    if not RAPIDAPI_KEY:
        raise RuntimeError("RAPIDAPI_KEY is not configured")
    if not RAPIDAPI_HOST:
        raise RuntimeError("RAPIDAPI_HOST is not configured")

    url = f"https://{RAPIDAPI_HOST}/genre"

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/json",
    }

    response = httpx.get(url, headers=headers)
    response.raise_for_status()

    return response.json()