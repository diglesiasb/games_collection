import os
import httpx

from dotenv import load_dotenv
from sqlalchemy.orm import Session
from .opencritic_usage import get_usage
from datetime import datetime, timezone, timedelta

load_dotenv()

USE_MOCK = os.getenv("OPENCRITIC_MOCK", "false").lower() == "true"

print("OPENCRITIC_MOCK =", USE_MOCK)

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST")

OPENCRITIC_USAGE = {
    "searches_limit": None,
    "searches_remaining": None,
    "searches_reset": None,
    "requests_limit": None,
    "requests_remaining": None,
    "requests_reset": None,
}

def get_header_int(
    response: httpx.Response,
    name: str,
):
    value = response.headers.get(name)

    if value is None:
        return None

    return int(value)

def update_rate_limit_info(
    response: httpx.Response,
    db: Session,
):

    usage = get_usage(db)
    if usage is None:
        raise RuntimeError("OpenCritic usage row not found")

    usage.searches_limit = get_header_int(
        response,
        "x-ratelimit-searches-limit",
    )

    usage.searches_remaining = get_header_int(
        response,
        "x-ratelimit-searches-remaining",
    )

    usage.requests_limit = get_header_int(
        response,
        "x-ratelimit-requests-limit",
    )

    usage.requests_remaining = get_header_int(
        response,
        "x-ratelimit-requests-remaining",
    )

    searches_reset = get_header_int(
        response,
        "x-ratelimit-searches-reset",
    )

    requests_reset = get_header_int(
        response,
        "x-ratelimit-requests-reset",
    )

    now = datetime.now(timezone.utc)

    if searches_reset is not None:
        usage.searches_reset_at = now + timedelta(
            seconds=searches_reset
        )

    if requests_reset is not None:
        usage.requests_reset_at = now + timedelta(
            seconds=requests_reset
        )

    usage.updated_at = now
        
    OPENCRITIC_USAGE["searches_limit"] = response.headers.get(
        "x-ratelimit-searches-limit"
    )
    OPENCRITIC_USAGE["searches_remaining"] = response.headers.get(
        "x-ratelimit-searches-remaining"
    )
    OPENCRITIC_USAGE["searches_reset"] = response.headers.get(
        "x-ratelimit-searches-reset"
    )

    OPENCRITIC_USAGE["requests_limit"] = response.headers.get(
        "x-ratelimit-requests-limit"
    )
    OPENCRITIC_USAGE["requests_remaining"] = response.headers.get(
        "x-ratelimit-requests-remaining"
    )
    OPENCRITIC_USAGE["requests_reset"] = response.headers.get(
        "x-ratelimit-requests-reset"
    )

    db.commit()


def search_games(criteria: str, db: Session):

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

    update_rate_limit_info(response, db)

    response.raise_for_status()

    return response.json()


def get_game(id_opencritic: int, db: Session):

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

    update_rate_limit_info(response, db)

    response.raise_for_status()

    return response.json()


IMAGE_SIZES = ["xl", "lg", "md", "sm", "xs", "og"]


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

    score = data.get("medianScore")
    if score == -1:
        score = None

    images = data.get("images") or {}
    masthead = images.get("masthead") or {}
    image = None

    for size in IMAGE_SIZES:
        if masthead.get(size):
            image = f"https://img.opencritic.com/{masthead[size]}"
            break

    return {
        "id_opencritic": data.get("id"),
        "title": data.get("name"),
        "developer": developer,
        "publisher": publisher,
        "opencritic_score": score,
        "genres": genres,
        "platforms": platforms,
        "image": image,
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
