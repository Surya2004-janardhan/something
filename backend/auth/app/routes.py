"""Auth service routes."""

from flask import Blueprint, request, jsonify, g

from .services import AuthService
from shared.middlewares.auth import jwt_required

auth_bp = Blueprint("auth", __name__)
_service = AuthService()


@auth_bp.post("/register")
def register():
    data = request.get_json(force=True)
    user = _service.register(data.get("email"), data.get("password"))
    return jsonify(user), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(force=True)
    result = _service.login(data.get("email"), data.get("password"))
    if result is None:
        return jsonify({"error": "Invalid credentials"}), 401
    return jsonify(result)


@auth_bp.get("/me")
@jwt_required
def me():
    return jsonify(g.current_user)
