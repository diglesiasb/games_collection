from fastapi import FastAPI, Depends
from sqlalchemy import text, select
from sqlalchemy.orm import Session

from .database import engine
from .models.game import Game

def get_db():
    with Session(engine) as session:
        yield session

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

@app.get("/games")
def get_games(db: Session = Depends(get_db)):
    result = db.execute(select(Game))
    games = result.scalars().all()

    return games