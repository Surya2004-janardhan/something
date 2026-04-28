"""JWT authentication middleware / decorator shared by all Flask services."""

from functools import wraps

from flask import request, jsonify, g

from shared.utils.jwt import decode_access_token


def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            payload = decode_access_token(token)
            g.current_user = payload
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401
        return f(*args, **kwargs)

    return decorated
