const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...init,
  });
  if (!res.ok) throw new Error(`Agents API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export const agentsClient = {
  list: (token: string) => request<{ agents: unknown[] }>("/agents", token),
  get: (token: string, id: string) => request<unknown>(`/agents/${id}`, token),
  create: (token: string, payload: unknown) =>
    request<unknown>("/agents", token, { method: "POST", body: JSON.stringify(payload) }),
};
