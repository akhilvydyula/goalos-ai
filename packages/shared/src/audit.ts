import type { PrismaClient } from "@prisma/client";

export type AuditInput = {
  orgId: string;
  userId?: string | null;
  action: string;
  resource: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
};

export async function writeAudit(prisma: PrismaClient, input: AuditInput) {
  return prisma.auditLog.create({
    data: {
      orgId: input.orgId,
      userId: input.userId ?? null,
      action: input.action,
      resource: input.resource,
      metadata: input.metadata ? { ...input.metadata, ip: input.ip, userAgent: input.userAgent } : undefined,
    },
  });
}

export function auditContext(request: { ip?: string; headers: Record<string, unknown> }) {
  const forwarded = request.headers["x-forwarded-for"];
  const ip =
    typeof forwarded === "string"
      ? forwarded.split(",")[0]?.trim()
      : typeof request.ip === "string"
        ? request.ip
        : undefined;
  const userAgent =
    typeof request.headers["user-agent"] === "string" ? request.headers["user-agent"] : undefined;
  return { ip, userAgent };
}
