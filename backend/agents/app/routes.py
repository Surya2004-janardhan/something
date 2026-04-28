"""Agents service routes."""

from flask import Blueprint, request, jsonify, g

from .services import AgentsService
from shared.middlewares.auth import jwt_required

agents_bp = Blueprint("agents", __name__)
_service = AgentsService()


@agents_bp.get("/")
@jwt_required
def list_agents():
    return jsonify({"agents": _service.list_agents()})


@agents_bp.get("/<agent_id>")
@jwt_required
def get_agent(agent_id: str):
    agent = _service.get_agent(agent_id)
    if agent is None:
        return jsonify({"error": "Agent not found"}), 404
    return jsonify(agent)


@agents_bp.post("/")
@jwt_required
def create_agent():
    data = request.get_json(force=True)
    agent = _service.create_agent(data)
    return jsonify(agent), 201


@agents_bp.delete("/<agent_id>")
@jwt_required
def delete_agent(agent_id: str):
    _service.delete_agent(agent_id)
    return "", 204
