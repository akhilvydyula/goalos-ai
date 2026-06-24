const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; displayName?: string | null };
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    role: string;
  };
};

function isSaasEnabled(): boolean {
  return Boolean(API_URL);
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error("SaaS API not configured (set NEXT_PUBLIC_API_URL)");
  }

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const goalosApi = {
  enabled: isSaasEnabled,

  register(input: {
    email: string;
    password: string;
    displayName?: string;
    orgName?: string;
  }) {
    return request<AuthSession>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  login(email: string, password: string) {
    return request<AuthSession>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getScore(token: string) {
    return request<{ total: number }>("/v1/insights/score", { token });
  },

  getActiveGoal(token: string) {
    return request<unknown>("/v1/goals/active", { token });
  },

  ingestUsage(
    token: string,
    events: Array<{
      packageName: string;
      appName: string;
      classification: string;
      minutes: number;
    }>
  ) {
    return request<{ ingested: number }>("/v1/usage/events", {
      method: "POST",
      token,
      body: JSON.stringify({ events }),
    });
  },

  coachChat(token: string, message: string) {
    return request<{ message: { text: string }; score: number }>("/v1/coach/chat", {
      method: "POST",
      token,
      body: JSON.stringify({ message }),
    });
  },
};
