import type { MemberRole } from "./types.js";

export type Permission =
  | "org:read"
  | "org:manage"
  | "members:invite"
  | "members:manage"
  | "audit:read"
  | "apikeys:manage"
  | "billing:manage"
  | "sso:manage"
  | "data:export"
  | "data:delete"
  | "data:read"
  | "data:write";

const ALL_READ: Permission[] = ["org:read", "data:read", "data:export"];

export const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
  OWNER: [
    ...ALL_READ,
    "org:manage",
    "members:invite",
    "members:manage",
    "audit:read",
    "apikeys:manage",
    "billing:manage",
    "sso:manage",
    "data:write",
    "data:delete",
  ],
  ADMIN: [
    ...ALL_READ,
    "org:manage",
    "members:invite",
    "members:manage",
    "audit:read",
    "apikeys:manage",
    "billing:manage",
    "data:write",
  ],
  MEMBER: [...ALL_READ, "data:write"],
  VIEWER: [...ALL_READ],
};

export function hasPermission(role: MemberRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function requirePermission(role: MemberRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new PermissionError(permission);
  }
}

export class PermissionError extends Error {
  readonly code = "FORBIDDEN";
  readonly statusCode = 403;

  constructor(permission: Permission) {
    super(`Missing permission: ${permission}`);
    this.name = "PermissionError";
  }
}

export const PLAN_LIMITS: Record<
  string,
  { seats: number; apiKeys: number; sso: boolean; auditRetentionDays: number }
> = {
  FREE: { seats: 3, apiKeys: 2, sso: false, auditRetentionDays: 30 },
  PRO: { seats: 25, apiKeys: 10, sso: false, auditRetentionDays: 90 },
  ENTERPRISE: { seats: 500, apiKeys: 100, sso: true, auditRetentionDays: 365 },
};
