from datetime import datetime

from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class OpenCriticUsage(Base):
    __tablename__ = "opencritic_usage"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    searches_limit: Mapped[int | None] = mapped_column(
        nullable=True
    )

    searches_remaining: Mapped[int | None] = mapped_column(
        nullable=True
    )

    searches_reset_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    requests_limit: Mapped[int | None] = mapped_column(
        nullable=True
    )

    requests_remaining: Mapped[int | None] = mapped_column(
        nullable=True
    )

    requests_reset_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )