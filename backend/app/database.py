import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import URL, create_engine


BASE_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BASE_DIR / ".env")


DATABASE_URL = URL.create(
    "postgresql+psycopg",
    username=os.environ["POSTGRES_USER"],
    password=os.environ["POSTGRES_PASSWORD"],
    host="127.0.0.1",
    port=5432,
    database=os.environ["POSTGRES_DB"],
)


engine = create_engine(DATABASE_URL)
