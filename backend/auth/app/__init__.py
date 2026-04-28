"""Auth Flask application factory."""

from flask import Flask
from flask_cors import CORS

from .routes import auth_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "auth"}

    return app
