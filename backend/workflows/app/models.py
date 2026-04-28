"""Workflow data models."""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class WorkflowStep:
    agent_id: str
    order: int
    config: dict = field(default_factory=dict)
    id: str = field(default_factory=lambda: str(uuid.uuid4()))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "order": self.order,
            "config": self.config,
        }


@dataclass
class Workflow:
    name: str
    description: str = ""
    steps: list = field(default_factory=list)
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "steps": [s.to_dict() for s in self.steps],
            "created_at": self.created_at.isoformat(),
        }
