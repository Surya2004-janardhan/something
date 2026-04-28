"""Auth data models."""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class User:
    email: str
    password_hash: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
        }
