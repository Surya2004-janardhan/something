"""Notifications service routes."""

from flask import Blueprint, request, jsonify

from .services import NotificationsService
from shared.middlewares.auth import jwt_required

notifications_bp = Blueprint("notifications", __name__)
_service = NotificationsService()


@notifications_bp.get("/")
@jwt_required
def list_notifications():
    return jsonify({"notifications": _service.list_notifications()})


@notifications_bp.post("/send")
@jwt_required
def send_notification():
    data = request.get_json(force=True)
    result = _service.send(data)
    return jsonify(result), 201
