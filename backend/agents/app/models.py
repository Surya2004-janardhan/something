"""Agent data models."""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class Agent:
    name: str
    description: str = ""
    status: str = "idle"
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }
