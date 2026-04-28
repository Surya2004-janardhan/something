"""Agents Flask application factory."""

from flask import Flask
from flask_cors import CORS

from .routes import agents_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(agents_bp, url_prefix="/agents")

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "agents"}

    return app
