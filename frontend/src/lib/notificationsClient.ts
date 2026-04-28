const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...init,
  });
  if (!res.ok) throw new Error(`Notifications API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export const notificationsClient = {
  list: (token: string) => request<{ notifications: unknown[] }>("/notifications", token),
  send: (token: string, payload: unknown) =>
    request<unknown>("/notifications/send", token, { method: "POST", body: JSON.stringify(payload) }),
};
