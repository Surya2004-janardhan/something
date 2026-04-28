"""Shared base model with common timestamp fields."""

import uuid
from datetime import datetime, timezone


class TimestampMixin:
    """Provides created_at / updated_at helpers for ORM models."""

    @staticmethod
    def now() -> datetime:
        return datetime.now(timezone.utc)

    @staticmethod
    def new_id() -> str:
        return str(uuid.uuid4())
