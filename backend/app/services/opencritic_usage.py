from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models.opencritic_usage import OpenCriticUsage


def get_usage(db: Session):
    return db.get(OpenCriticUsage, 1)

def is_quota_exhausted(
    remaining: int | None,
    reset_at: datetime | None,
) -> bool:

    if remaining is None or remaining > 0:
        return False

    if reset_at is None:
        return True

    now = datetime.now(timezone.utc)

    return reset_at > now


def check_quota(
    db: Session,
    is_search: bool = False,
) -> None:

    usage = get_usage(db)

    if usage is None:
        raise RuntimeError("OpenCritic usage row not found")

    if is_search and is_quota_exhausted(
        usage.searches_remaining,
        usage.searches_reset_at,
    ):
        raise OpenCriticQuotaExceeded(
            "OpenCritic search quota exhausted",
            usage.searches_reset_at,
        )

    if is_quota_exhausted(
        usage.requests_remaining,
        usage.requests_reset_at,
    ):
        raise OpenCriticQuotaExceeded(
            "OpenCritic request quota exhausted",
            usage.requests_reset_at,
        )


class OpenCriticQuotaExceeded(Exception):

    def __init__(
        self,
        message: str,
        reset_at: datetime | None,
    ):
        self.message = message
        self.reset_at = reset_at

        super().__init__(message)