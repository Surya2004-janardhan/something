"""Notifications service business logic."""

import uuid
from datetime import datetime, timezone


_notifications: list[dict] = []


class NotificationsService:
    def list_notifications(self) -> list[dict]:
        return list(_notifications)

    def send(self, data: dict) -> dict:
        notification = {
            "id": str(uuid.uuid4()),
            "type": data.get("type", "email"),
            "message": data.get("message", ""),
            "recipient": data.get("recipient", ""),
            "sent_at": datetime.now(timezone.utc).isoformat(),
        }
        _notifications.append(notification)
        # Placeholder: integrate with email / webhook provider here
        return notification
