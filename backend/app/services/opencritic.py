import os

import httpx
from dotenv import load_dotenv


load_dotenv()


RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST")


def search_games(criteria: str):
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