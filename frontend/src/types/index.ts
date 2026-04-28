export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: "idle" | "running" | "error";
  created_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  created_at: string;
}

export interface WorkflowStep {
  id: string;
  agent_id: string;
  order: number;
  config: Record<string, unknown>;
}

export interface Notification {
  id: string;
  type: "email" | "webhook";
  message: string;
  sent_at: string;
}
