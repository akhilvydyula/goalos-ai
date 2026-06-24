import type {
  ApiKeyRecord,
  AuditLogEntry,
  AuthSession,
  BillingStatus,
  OrgMember,
} from "@/lib/api/goalos-api";
import { DEMO_ACCOUNTS } from "@/lib/demo-credentials";

export const DEMO_ACCESS_TOKEN = "demo-access-token";

export function isDemoSession(session: AuthSession | null): boolean {
  return session?.accessToken === DEMO_ACCESS_TOKEN;
}

export function buildDemoSession(account: (typeof DEMO_ACCOUNTS)[number]): AuthSession {
  return {
    accessToken: DEMO_ACCESS_TOKEN,
    refreshToken: "demo-refresh-token",
    user: {
      id: `demo-user-${account.id}`,
      email: account.email,
      displayName: account.displayName,
    },
    organization: {
      id: "demo-org-atopush",
      name: account.orgName,
      slug: "atopush-demo",
      plan: account.plan,
      role: account.role,
    },
  };
}

export const demoMembers: OrgMember[] = DEMO_ACCOUNTS.map((a) => ({
  id: `demo-member-${a.id}`,
  role: a.role,
  joinedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  user: {
    id: `demo-user-${a.id}`,
    email: a.email,
    displayName: a.displayName,
  },
}));

export const demoAuditLogs: AuditLogEntry[] = [
  {
    id: "audit-1",
    action: "user.login",
    resource: "user",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    user: { email: "admin@demo.goalos", displayName: "Demo Admin" },
  },
  {
    id: "audit-2",
    action: "members.invite",
    resource: "organization_member",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    user: { email: "admin@demo.goalos", displayName: "Demo Admin" },
  },
  {
    id: "audit-3",
    action: "apikey.create",
    resource: "api_key",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    user: { email: "admin@demo.goalos", displayName: "Demo Admin" },
  },
];

export const demoApiKeys: ApiKeyRecord[] = [
  {
    id: "key-1",
    name: "Demo integration",
    keyPrefix: "gos_demo",
    lastUsedAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: null,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
];

export const demoBilling: BillingStatus = {
  plan: "ENTERPRISE",
  limits: { seats: 25, apiKeys: 10, sso: true, auditRetentionDays: 365 },
  usage: { seats: 2, apiKeys: 1 },
  subscription: { status: "trialing", seatLimit: 25 },
};
