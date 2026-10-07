from sqlalchemy.orm import Session

from ..models.opencritic_usage import OpenCriticUsage


def get_usage(db: Session):
    return db.get(OpenCriticUsage, 1)