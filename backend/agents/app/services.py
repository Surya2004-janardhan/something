"""Agents business logic."""

from typing import Optional

from .models import Agent

_agents: dict[str, Agent] = {}


class AgentsService:
    def list_agents(self) -> list[dict]:
        return [a.to_dict() for a in _agents.values()]

    def get_agent(self, agent_id: str) -> Optional[dict]:
        agent = _agents.get(agent_id)
        return agent.to_dict() if agent else None

    def create_agent(self, data: dict) -> dict:
        agent = Agent(
            name=data.get("name", "Unnamed"),
            description=data.get("description", ""),
        )
        _agents[agent.id] = agent
        return agent.to_dict()

    def delete_agent(self, agent_id: str) -> None:
        _agents.pop(agent_id, None)
