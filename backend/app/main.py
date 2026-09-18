from sys import platform

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import FileResponse
from pathlib import Path

from sqlalchemy import text, select
from sqlalchemy.orm import Session

from .database import engine

from app.schemas import collection

from .routers import opencritic, platforms, genres, games,  collection


def get_db():
    with Session(engine) as session:
        yield session


app = FastAPI(title="Games Collection API", version="0.1.0", docs_url=None)

app.include_router(opencritic.router)
app.include_router(platforms.router)
app.include_router(genres.router)
app.include_router(games.router)
app.include_router(collection.router)


@app.get("/swagger-dark.css", include_in_schema=False)
def swagger_dark_css():
    return FileResponse("app/swagger-dark.css")


@app.get("/docs", include_in_schema=False)
def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - Swagger UI",
        swagger_css_url="/swagger-dark.css",
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://192.168.0.54:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Games Collection API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/db")
def database_health():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {"status": "ok", "database": result.scalar_one()}
