const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; displayName?: string | null };
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    role: MemberRole;
  };
};

export type OrgMember = {
  id: string;
  role: MemberRole;
  joinedAt: string;
  user: { id: string; email: string; displayName?: string | null };
};

export type AuditLogEntry = {
  id: string;
  action: string;
  resource: string;
  createdAt: string;
  user?: { email: string; displayName?: string | null } | null;
};

export type ApiKeyRecord = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type BillingStatus = {
  plan: string;
  limits: { seats: number; apiKeys: number; sso: boolean; auditRetentionDays: number };
  usage: { seats: number; apiKeys: number };
  subscription: { status: string; seatLimit: number } | null;
};

function isSaasEnabled(): boolean {
  return Boolean(API_URL);
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error("API not configured. Set NEXT_PUBLIC_API_URL and run the platform stack.");
  }

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `API error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const goalosApi = {
  enabled: isSaasEnabled,
  baseUrl: API_URL,

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

  refresh(refreshToken: string) {
    return request<{ accessToken: string }>("/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  getOrg(token: string) {
    return request<{
      id: string;
      name: string;
      slug: string;
      plan: string;
      members: OrgMember[];
      subscriptions: { status: string; seatLimit: number } | null;
    }>("/v1/orgs/me", { token });
  },

  getMembers(token: string) {
    return request<OrgMember[]>("/v1/orgs/members", { token });
  },

  inviteMember(token: string, email: string, role: MemberRole = "MEMBER") {
    return request<{ inviteId: string; inviteToken: string; email: string }>("/v1/orgs/invites", {
      method: "POST",
      token,
      body: JSON.stringify({ email, role }),
    });
  },

  acceptInvite(input: { token: string; password?: string; displayName?: string }) {
    return request<{ accessToken: string; organization: { id: string; name: string } }>(
      "/v1/orgs/invites/accept",
      { method: "POST", body: JSON.stringify(input) }
    );
  },

  updateMemberRole(token: string, memberId: string, role: MemberRole) {
    return request<OrgMember>(`/v1/orgs/members/${memberId}/role`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ role }),
    });
  },

  removeMember(token: string, memberId: string) {
    return request<void>(`/v1/orgs/members/${memberId}`, { method: "DELETE", token });
  },

  getAuditLogs(token: string, limit = 50) {
    return request<AuditLogEntry[]>(`/v1/admin/audit-logs?limit=${limit}`, { token });
  },

  listApiKeys(token: string) {
    return request<ApiKeyRecord[]>("/v1/api-keys", { token });
  },

  createApiKey(token: string, name: string, expiresInDays?: number) {
    return request<{ id: string; name: string; keyPrefix: string; apiKey: string }>("/v1/api-keys", {
      method: "POST",
      token,
      body: JSON.stringify({ name, expiresInDays }),
    });
  },

  revokeApiKey(token: string, keyId: string) {
    return request<void>(`/v1/api-keys/${keyId}`, { method: "DELETE", token });
  },

  getBillingStatus(token: string) {
    return request<BillingStatus>("/v1/billing/status", { token });
  },

  checkout(token: string, plan: "PRO" | "ENTERPRISE", seats?: number) {
    return request<{ status: string; plan: string; seats: number }>("/v1/billing/checkout", {
      method: "POST",
      token,
      body: JSON.stringify({ plan, seats }),
    });
  },

  exportData(token: string) {
    return request<unknown>("/v1/compliance/export", { token });
  },

  requestDeletion(token: string) {
    return request<{ status: string; message: string }>("/v1/compliance/delete-request", {
      method: "POST",
      token,
      body: JSON.stringify({}),
    });
  },

  getScore(token: string) {
    return request<{ total: number }>("/v1/insights/score", { token });
  },

  getWeeklyInsights(token: string) {
    return request<unknown>("/v1/insights/weekly", { token });
  },

  getActiveGoal(token: string) {
    return request<unknown>("/v1/goals/active", { token });
  },

  coachChat(token: string, message: string) {
    return request<{ message: { text: string }; score: number }>("/v1/coach/chat", {
      method: "POST",
      token,
      body: JSON.stringify({ message }),
    });
  },

  healthServices() {
    return request<{ status: string; services: Array<{ name: string; ok: boolean }> }>(
      "/v1/health/services"
    );
  },
};
