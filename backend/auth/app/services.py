"""Auth business logic."""

import hashlib
import os
from typing import Optional

from .models import User
from shared.utils.jwt import create_access_token

# In-memory store — replace with a real DB (SQLAlchemy + Postgres)
_users: dict[str, User] = {}


def _hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    h = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return f"{salt}:{h}"


def _verify_password(password: str, password_hash: str) -> bool:
    salt, h = password_hash.split(":", 1)
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest() == h


class AuthService:
    def register(self, email: str, password: str) -> dict:
        if email in _users:
            raise ValueError("Email already registered")
        user = User(email=email, password_hash=_hash_password(password))
        _users[email] = user
        return user.to_dict()

    def login(self, email: str, password: str) -> Optional[dict]:
        user = _users.get(email)
        if user is None or not _verify_password(password, user.password_hash):
            return None
        token = create_access_token({"sub": user.id, "email": user.email})
        return {"access_token": token, "token_type": "bearer"}
