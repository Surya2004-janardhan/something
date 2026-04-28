"""Notifications Flask application factory."""

from flask import Flask
from flask_cors import CORS

from .routes import notifications_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(notifications_bp, url_prefix="/notifications")

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "notifications"}

    return app
