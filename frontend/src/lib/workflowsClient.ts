const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...init,
  });
  if (!res.ok) throw new Error(`Workflows API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export const workflowsClient = {
  list: (token: string) => request<{ workflows: unknown[] }>("/workflows", token),
  get: (token: string, id: string) => request<unknown>(`/workflows/${id}`, token),
  run: (token: string, id: string, payload: { input: string }) =>
    request<unknown>(`/workflows/${id}/run`, token, { method: "POST", body: JSON.stringify(payload) }),
  updateSchedule: (
    token: string,
    id: string,
    payload: { scheduleCron?: string | null; scheduleEnabled?: boolean; scheduleInput?: string | null },
  ) => request<unknown>(`/workflows/${id}/schedule`, token, { method: "PATCH", body: JSON.stringify(payload) }),
};
