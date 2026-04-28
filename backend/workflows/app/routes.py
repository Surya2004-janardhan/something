"""Workflows service routes."""

from flask import Blueprint, request, jsonify

from .services import WorkflowsService
from shared.middlewares.auth import jwt_required

workflows_bp = Blueprint("workflows", __name__)
_service = WorkflowsService()


@workflows_bp.get("/")
@jwt_required
def list_workflows():
    return jsonify({"workflows": _service.list_workflows()})


@workflows_bp.get("/<workflow_id>")
@jwt_required
def get_workflow(workflow_id: str):
    wf = _service.get_workflow(workflow_id)
    if wf is None:
        return jsonify({"error": "Workflow not found"}), 404
    return jsonify(wf)


@workflows_bp.post("/")
@jwt_required
def create_workflow():
    data = request.get_json(force=True)
    wf = _service.create_workflow(data)
    return jsonify(wf), 201


@workflows_bp.post("/<workflow_id>/trigger")
@jwt_required
def trigger_workflow(workflow_id: str):
    result = _service.trigger_workflow(workflow_id)
    if result is None:
        return jsonify({"error": "Workflow not found"}), 404
    return jsonify(result)


@workflows_bp.delete("/<workflow_id>")
@jwt_required
def delete_workflow(workflow_id: str):
    _service.delete_workflow(workflow_id)
    return "", 204
