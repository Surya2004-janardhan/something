"""Workflows business logic."""

from typing import Optional

from .models import Workflow, WorkflowStep

_workflows: dict[str, Workflow] = {}


class WorkflowsService:
    def list_workflows(self) -> list[dict]:
        return [wf.to_dict() for wf in _workflows.values()]

    def get_workflow(self, workflow_id: str) -> Optional[dict]:
        wf = _workflows.get(workflow_id)
        return wf.to_dict() if wf else None

    def create_workflow(self, data: dict) -> dict:
        steps = [
            WorkflowStep(
                agent_id=s.get("agent_id", ""),
                order=s.get("order", idx),
                config=s.get("config", {}),
            )
            for idx, s in enumerate(data.get("steps", []))
        ]
        wf = Workflow(
            name=data.get("name", "Unnamed"),
            description=data.get("description", ""),
            steps=steps,
        )
        _workflows[wf.id] = wf
        return wf.to_dict()

    def trigger_workflow(self, workflow_id: str) -> Optional[dict]:
        wf = _workflows.get(workflow_id)
        if wf is None:
            return None
        # Placeholder: enqueue steps for execution
        return {"workflow_id": workflow_id, "status": "triggered"}

    def delete_workflow(self, workflow_id: str) -> None:
        _workflows.pop(workflow_id, None)
