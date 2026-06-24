import { createHash, randomBytes } from "node:crypto";
import type { PrismaClient } from "@goalos/database";
import type { FastifyInstance } from "fastify";
import {
  acceptInviteSchema,
  auditContext,
  billingCheckoutSchema,
  createApiKeySchema,
  inviteMemberSchema,
  PermissionError,
  permissionPreHandler,
  PLAN_LIMITS,
  requirePermission,
  signAccessToken,
  ssoConfigSchema,
  switchOrgSchema,
  updateMemberRoleSchema,
  writeAudit,
} from "@goalos/shared";

type EnterpriseDeps = {
  prisma: PrismaClient;
  jwtSecret: string;
  hashPassword: (password: string) => string;
  verifyPassword: (password: string, stored: string) => boolean;
  authenticate: ReturnType<typeof import("@goalos/shared").authPreHandler>;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function handlePermissionError(reply: import("fastify").FastifyReply, err: unknown) {
  if (err instanceof Error && "statusCode" in err && (err as PermissionError).statusCode === 403) {
    return reply.code(403).send({ error: err.message, code: "FORBIDDEN" });
  }
  throw err;
}

export function registerEnterpriseRoutes(app: FastifyInstance, deps: EnterpriseDeps) {
  const { prisma, jwtSecret, hashPassword, verifyPassword, authenticate } = deps;
  const audit = permissionPreHandler("audit:read");
  const invite = permissionPreHandler("members:invite");
  const manageMembers = permissionPreHandler("members:manage");
  const apiKeys = permissionPreHandler("apikeys:manage");
  const billing = permissionPreHandler("billing:manage");
  const sso = permissionPreHandler("sso:manage");
  const dataExport = permissionPreHandler("data:export");
  const dataDelete = permissionPreHandler("data:delete");

  app.post("/orgs/invites", { preHandler: [authenticate, invite] }, async (request, reply) => {
    const parsed = inviteMemberSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid invite payload" });

    const org = await prisma.organization.findUnique({
      where: { id: request.user!.orgId },
      include: { members: true, subscriptions: true },
    });
    if (!org) return reply.code(404).send({ error: "Organization not found" });

    const limits = PLAN_LIMITS[org.plan] ?? PLAN_LIMITS.FREE;
    const seatLimit = org.subscriptions?.seatLimit ?? limits.seats;
    if (org.members.length >= seatLimit) {
      return reply.code(402).send({ error: "Seat limit reached", seatLimit });
    }

    const token = randomBytes(32).toString("hex");
    const inviteRecord = await prisma.orgInvite.create({
      data: {
        orgId: org.id,
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.role,
        tokenHash: hashToken(token),
        invitedBy: request.user!.sub,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const ctx = auditContext(request);
    await writeAudit(prisma, {
      orgId: org.id,
      userId: request.user!.sub,
      action: "member.invite",
      resource: inviteRecord.id,
      metadata: { email: parsed.data.email, role: parsed.data.role },
      ...ctx,
    });

    return reply.code(201).send({
      inviteId: inviteRecord.id,
      email: inviteRecord.email,
      role: inviteRecord.role,
      expiresAt: inviteRecord.expiresAt,
      inviteToken: token,
    });
  });

  app.post("/orgs/invites/accept", async (request, reply) => {
    const parsed = acceptInviteSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid accept payload" });

    const invite = await prisma.orgInvite.findUnique({
      where: { tokenHash: hashToken(parsed.data.token) },
      include: { organization: true },
    });
    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
      return reply.code(400).send({ error: "Invite invalid or expired" });
    }

    let user = await prisma.user.findUnique({ where: { email: invite.email } });
    if (!user) {
      if (!parsed.data.password) {
        return reply.code(400).send({ error: "Password required for new users" });
      }
      user = await prisma.user.create({
        data: {
          email: invite.email,
          displayName: parsed.data.displayName ?? invite.email.split("@")[0],
          passwordHash: hashPassword(parsed.data.password),
        },
      });
    }

    await prisma.organizationMember.upsert({
      where: { orgId_userId: { orgId: invite.orgId, userId: user.id } },
      create: { orgId: invite.orgId, userId: user.id, role: invite.role },
      update: { role: invite.role },
    });

    await prisma.orgInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    const accessToken = signAccessToken(
      { sub: user.id, email: user.email, orgId: invite.orgId, role: invite.role },
      jwtSecret
    );

    return { accessToken, organization: invite.organization };
  });

  app.patch("/orgs/members/:memberId/role", { preHandler: [authenticate, manageMembers] }, async (request, reply) => {
    const parsed = updateMemberRoleSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid role payload" });

    const { memberId } = request.params as { memberId: string };
    const member = await prisma.organizationMember.findFirst({
      where: { id: memberId, orgId: request.user!.orgId },
    });
    if (!member) return reply.code(404).send({ error: "Member not found" });
    if (member.role === "OWNER") return reply.code(400).send({ error: "Cannot change owner role" });

    const updated = await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role: parsed.data.role },
      include: { user: { select: { id: true, email: true, displayName: true } } },
    });

    await writeAudit(prisma, {
      orgId: request.user!.orgId,
      userId: request.user!.sub,
      action: "member.role_update",
      resource: memberId,
      metadata: { role: parsed.data.role },
      ...auditContext(request),
    });

    return updated;
  });

  app.delete("/orgs/members/:memberId", { preHandler: [authenticate, manageMembers] }, async (request, reply) => {
    const { memberId } = request.params as { memberId: string };
    const member = await prisma.organizationMember.findFirst({
      where: { id: memberId, orgId: request.user!.orgId },
    });
    if (!member) return reply.code(404).send({ error: "Member not found" });
    if (member.role === "OWNER") return reply.code(400).send({ error: "Cannot remove owner" });

    await prisma.organizationMember.delete({ where: { id: memberId } });
    await writeAudit(prisma, {
      orgId: request.user!.orgId,
      userId: request.user!.sub,
      action: "member.remove",
      resource: memberId,
      ...auditContext(request),
    });

    return reply.code(204).send();
  });

  app.post("/auth/switch-org", { preHandler: authenticate }, async (request, reply) => {
    const parsed = switchOrgSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid org switch payload" });

    const membership = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: parsed.data.orgId, userId: request.user!.sub } },
      include: { organization: true },
    });
    if (!membership) return reply.code(403).send({ error: "Not a member of this organization" });

    const accessToken = signAccessToken(
      {
        sub: request.user!.sub,
        email: request.user!.email,
        orgId: membership.orgId,
        role: membership.role,
      },
      jwtSecret
    );

    return {
      accessToken,
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        plan: membership.organization.plan,
        role: membership.role,
      },
    };
  });

  app.get("/admin/audit-logs", { preHandler: [authenticate, audit] }, async (request) => {
    const query = request.query as { limit?: string; cursor?: string };
    const limit = Math.min(Number(query.limit ?? 50), 200);

    return prisma.auditLog.findMany({
      where: { orgId: request.user!.orgId },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      include: { user: { select: { id: true, email: true, displayName: true } } },
    });
  });

  app.get("/compliance/export", { preHandler: [authenticate, dataExport] }, async (request, reply) => {
    const orgId = request.user!.orgId;
    const [org, goals, apps, events, sprints, messages, scores, auditLogs] = await Promise.all([
      prisma.organization.findUnique({ where: { id: orgId }, include: { members: true } }),
      prisma.goal.findMany({ where: { orgId }, include: { milestones: true } }),
      prisma.trackedApp.findMany({ where: { orgId } }),
      prisma.usageEvent.findMany({ where: { orgId }, take: 5000, orderBy: { recordedAt: "desc" } }),
      prisma.focusSprint.findMany({ where: { orgId } }),
      prisma.coachMessage.findMany({ where: { orgId } }),
      prisma.scoreSnapshot.findMany({ where: { orgId } }),
      prisma.auditLog.findMany({ where: { orgId }, take: 1000, orderBy: { createdAt: "desc" } }),
    ]);

    await writeAudit(prisma, {
      orgId,
      userId: request.user!.sub,
      action: "compliance.export",
      resource: orgId,
      ...auditContext(request),
    });

    reply.header("Content-Disposition", `attachment; filename="goalos-export-${orgId}.json"`);
    return {
      exportedAt: new Date().toISOString(),
      organization: org,
      goals,
      trackedApps: apps,
      usageEvents: events,
      focusSprints: sprints,
      coachMessages: messages,
      scoreSnapshots: scores,
      auditLogs,
    };
  });

  app.post("/compliance/delete-request", { preHandler: [authenticate, dataDelete] }, async (request, reply) => {
    try {
      requirePermission(request.user!.role, "data:delete");
    } catch (err) {
      return handlePermissionError(reply, err);
    }

    await writeAudit(prisma, {
      orgId: request.user!.orgId,
      userId: request.user!.sub,
      action: "compliance.delete_requested",
      resource: request.user!.sub,
      ...auditContext(request),
    });

    return {
      status: "queued",
      message: "Account deletion request recorded. Data purge runs within 30 days per enterprise policy.",
    };
  });

  app.post("/api-keys", { preHandler: [authenticate, apiKeys] }, async (request, reply) => {
    const parsed = createApiKeySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid API key payload" });

    const org = await prisma.organization.findUnique({ where: { id: request.user!.orgId } });
    if (!org) return reply.code(404).send({ error: "Organization not found" });

    const limits = PLAN_LIMITS[org.plan] ?? PLAN_LIMITS.FREE;
    const activeKeys = await prisma.apiKey.count({
      where: { orgId: org.id, revokedAt: null },
    });
    if (activeKeys >= limits.apiKeys) {
      return reply.code(402).send({ error: "API key limit reached", limit: limits.apiKeys });
    }

    const rawKey = `gos_${randomBytes(24).toString("hex")}`;
    const keyPrefix = rawKey.slice(0, 12);
    const expiresAt = parsed.data.expiresInDays
      ? new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const record = await prisma.apiKey.create({
      data: {
        orgId: org.id,
        name: parsed.data.name,
        keyPrefix,
        keyHash: hashToken(rawKey),
        createdBy: request.user!.sub,
        expiresAt,
      },
    });

    await writeAudit(prisma, {
      orgId: org.id,
      userId: request.user!.sub,
      action: "apikey.create",
      resource: record.id,
      metadata: { name: parsed.data.name },
      ...auditContext(request),
    });

    return reply.code(201).send({ id: record.id, name: record.name, keyPrefix, apiKey: rawKey, expiresAt });
  });

  app.get("/api-keys", { preHandler: [authenticate, apiKeys] }, async (request) => {
    return prisma.apiKey.findMany({
      where: { orgId: request.user!.orgId, revokedAt: null },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  });

  app.delete("/api-keys/:keyId", { preHandler: [authenticate, apiKeys] }, async (request, reply) => {
    const { keyId } = request.params as { keyId: string };
    const key = await prisma.apiKey.findFirst({
      where: { id: keyId, orgId: request.user!.orgId, revokedAt: null },
    });
    if (!key) return reply.code(404).send({ error: "API key not found" });

    await prisma.apiKey.update({ where: { id: keyId }, data: { revokedAt: new Date() } });
    await writeAudit(prisma, {
      orgId: request.user!.orgId,
      userId: request.user!.sub,
      action: "apikey.revoke",
      resource: keyId,
      ...auditContext(request),
    });

    return reply.code(204).send();
  });

  app.get("/sso/config", { preHandler: [authenticate, sso] }, async (request, reply) => {
    const org = await prisma.organization.findUnique({ where: { id: request.user!.orgId } });
    if (!org) return reply.code(404).send({ error: "Organization not found" });

    const limits = PLAN_LIMITS[org.plan] ?? PLAN_LIMITS.FREE;
    if (!limits.sso) {
      return reply.code(402).send({ error: "SSO requires ENTERPRISE plan" });
    }

    const config = await prisma.ssoConfig.findUnique({ where: { orgId: org.id } });
    if (!config) return reply.code(404).send({ error: "SSO not configured" });
    return { ...config, clientSecret: config.clientSecret ? "[REDACTED]" : null };
  });

  app.put("/sso/config", { preHandler: [authenticate, sso] }, async (request, reply) => {
    const parsed = ssoConfigSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid SSO config" });

    const org = await prisma.organization.findUnique({ where: { id: request.user!.orgId } });
    if (!org) return reply.code(404).send({ error: "Organization not found" });

    const limits = PLAN_LIMITS[org.plan] ?? PLAN_LIMITS.FREE;
    if (!limits.sso) {
      return reply.code(402).send({ error: "SSO requires ENTERPRISE plan" });
    }

    const config = await prisma.ssoConfig.upsert({
      where: { orgId: org.id },
      create: {
        orgId: org.id,
        provider: parsed.data.provider,
        issuerUrl: parsed.data.issuerUrl,
        clientId: parsed.data.clientId,
        clientSecret: parsed.data.clientSecret,
        enabled: parsed.data.enabled,
      },
      update: {
        provider: parsed.data.provider,
        issuerUrl: parsed.data.issuerUrl,
        clientId: parsed.data.clientId,
        ...(parsed.data.clientSecret ? { clientSecret: parsed.data.clientSecret } : {}),
        enabled: parsed.data.enabled,
      },
    });

    await writeAudit(prisma, {
      orgId: org.id,
      userId: request.user!.sub,
      action: "sso.config_update",
      resource: config.id,
      ...auditContext(request),
    });

    return { ...config, clientSecret: config.clientSecret ? "[REDACTED]" : null };
  });

  app.post("/billing/checkout", { preHandler: [authenticate, billing] }, async (request, reply) => {
    const parsed = billingCheckoutSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid checkout payload" });

    const org = await prisma.organization.findUnique({
      where: { id: request.user!.orgId },
      include: { subscriptions: true },
    });
    if (!org) return reply.code(404).send({ error: "Organization not found" });

    const seats = parsed.data.seats ?? PLAN_LIMITS[parsed.data.plan].seats;
    await prisma.organization.update({
      where: { id: org.id },
      data: { plan: parsed.data.plan },
    });
    await prisma.subscription.upsert({
      where: { orgId: org.id },
      create: { orgId: org.id, status: "active", seatLimit: seats },
      update: { status: "active", seatLimit: seats },
    });

    await writeAudit(prisma, {
      orgId: org.id,
      userId: request.user!.sub,
      action: "billing.checkout",
      resource: parsed.data.plan,
      metadata: { seats },
      ...auditContext(request),
    });

    return {
      status: "active",
      plan: parsed.data.plan,
      seats,
      message: "Stripe integration ready — wire STRIPE_SECRET_KEY for live checkout sessions.",
      checkoutUrl: null,
    };
  });

  app.get("/billing/status", { preHandler: [authenticate, billing] }, async (request, reply) => {
    const org = await prisma.organization.findUnique({
      where: { id: request.user!.orgId },
      include: { subscriptions: true, members: true },
    });
    if (!org) return reply.code(404).send({ error: "Organization not found" });

    const limits = PLAN_LIMITS[org.plan] ?? PLAN_LIMITS.FREE;
    const apiKeyCount = await prisma.apiKey.count({
      where: { orgId: org.id, revokedAt: null },
    });

    return {
      plan: org.plan,
      limits,
      usage: {
        seats: org.members.length,
        apiKeys: apiKeyCount,
      },
      subscription: org.subscriptions,
    };
  });
}
