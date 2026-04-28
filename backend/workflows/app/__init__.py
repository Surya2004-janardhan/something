"""Workflows Flask application factory."""

from flask import Flask
from flask_cors import CORS

from .routes import workflows_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(workflows_bp, url_prefix="/workflows")

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "workflows"}

    return app
