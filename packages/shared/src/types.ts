export type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export type PlanTier = "FREE" | "PRO" | "ENTERPRISE";

export interface JwtPayload {
  sub: string;
  email: string;
  orgId: string;
  role: MemberRole;
  iat?: number;
  exp?: number;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface HealthResponse {
  service: string;
  status: "ok" | "degraded";
  version: string;
  timestamp: string;
}
