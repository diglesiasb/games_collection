from fastapi import FastAPI
from sqlalchemy import text

from .database import engine


app = FastAPI(
    title="Games Collection API",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "message": "Games Collection API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.get("/health/db")
def database_health():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": result.scalar_one()
        }
