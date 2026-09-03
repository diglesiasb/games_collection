from fastapi import FastAPI, Depends, HTTPException

from sqlalchemy import text, select
from sqlalchemy.orm import Session

from .database import engine

from .models.game import Game

from .schemas.game import GameCreate

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


@app.post("/games")
def create_game(game: GameCreate, db: Session = Depends(get_db)):
    new_game = Game(
        title=game.title,
        developer=game.developer,
        publisher=game.publisher,
        opencritic_score=game.opencritic_score
    )

    db.add(new_game)
    db.commit()
    db.refresh(new_game)

    return new_game


@app.get("/games/{id_game}")
def get_game(id_game: int, db: Session = Depends(get_db)):
    game = db.get(Game, id_game)

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found"
        )

    return game