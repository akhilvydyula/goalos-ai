import { createHash, randomBytes, scryptSync } from "node:crypto";
import { prisma } from "@goalos/database";
import {
  authPreHandler,
  getEnv,
  loginSchema,
  registerSchema,
  signAccessToken,
  signRefreshToken,
  slugify,
  verifyRefreshToken,
} from "@goalos/shared";
import Fastify from "fastify";

const PORT = Number(process.env.PORT ?? 4001);
const JWT_SECRET = getEnv("JWT_SECRET", "dev-secret-change-me");
const SERVICE = "auth-service";
const VERSION = "0.1.0";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const attempt = scryptSync(password, salt, 64).toString("hex");
  return attempt === hash;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function audit(orgId: string, userId: string | null, action: string, resource: string) {
  await prisma.auditLog.create({
    data: { orgId, userId, action, resource },
  });
}

const app = Fastify({ logger: true });
const authenticate = authPreHandler(JWT_SECRET);

app.get("/health", async () => ({
  service: SERVICE,
  status: "ok" as const,
  version: VERSION,
  timestamp: new Date().toISOString(),
}));

app.post("/auth/register", async (request, reply) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: "Invalid registration payload", details: parsed.error.flatten() });
  }

  const { email, password, displayName, orgName } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return reply.code(409).send({ error: "Email already registered" });
  }

  const orgLabel = orgName ?? `${displayName ?? email.split("@")[0]}'s workspace`;
  let slug = slugify(orgLabel);
  const slugTaken = await prisma.organization.findUnique({ where: { slug } });
  if (slugTaken) slug = `${slug}-${randomBytes(2).toString("hex")}`;

  const user = await prisma.user.create({
    data: {
      email,
      displayName: displayName ?? email.split("@")[0],
      passwordHash: hashPassword(password),
      memberships: {
        create: {
          role: "OWNER",
          organization: {
            create: {
              name: orgLabel,
              slug,
              subscriptions: { create: { status: "trialing", seatLimit: 5 } },
            },
          },
        },
      },
    },
    include: { memberships: { include: { organization: true } } },
  });

  const membership = user.memberships[0];
  const accessToken = signAccessToken(
    { sub: user.id, email: user.email, orgId: membership.orgId, role: membership.role },
    JWT_SECRET
  );
  const refreshToken = signRefreshToken(user.id, JWT_SECRET);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await audit(membership.orgId, user.id, "user.register", "user");

  return reply.code(201).send({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, displayName: user.displayName },
    organization: {
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      plan: membership.organization.plan,
      role: membership.role,
    },
  });
});

app.post("/auth/login", async (request, reply) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: "Invalid login payload" });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: {
      memberships: {
        include: { organization: true },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return reply.code(401).send({ error: "Invalid email or password" });
  }

  const membership = user.memberships[0];
  if (!membership) {
    return reply.code(403).send({ error: "No organization membership" });
  }

  const accessToken = signAccessToken(
    { sub: user.id, email: user.email, orgId: membership.orgId, role: membership.role },
    JWT_SECRET
  );
  const refreshToken = signRefreshToken(user.id, JWT_SECRET);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, displayName: user.displayName },
    organization: {
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      plan: membership.organization.plan,
      role: membership.role,
    },
  };
});

app.post("/auth/refresh", async (request, reply) => {
  const body = request.body as { refreshToken?: string };
  if (!body.refreshToken) {
    return reply.code(400).send({ error: "refreshToken required" });
  }

  let userId: string;
  try {
    userId = verifyRefreshToken(body.refreshToken, JWT_SECRET).sub;
  } catch {
    return reply.code(401).send({ error: "Invalid refresh token" });
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(body.refreshToken) },
  });
  if (!stored || stored.expiresAt < new Date()) {
    return reply.code(401).send({ error: "Refresh token expired" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: { organization: true },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  if (!user?.memberships[0]) {
    return reply.code(403).send({ error: "No organization membership" });
  }

  const membership = user.memberships[0];
  const accessToken = signAccessToken(
    { sub: user.id, email: user.email, orgId: membership.orgId, role: membership.role },
    JWT_SECRET
  );

  return { accessToken };
});

app.get("/orgs/me", { preHandler: authenticate }, async (request, reply) => {
  const org = await prisma.organization.findUnique({
    where: { id: request.user!.orgId },
    include: {
      members: { include: { user: { select: { id: true, email: true, displayName: true } } } },
      subscriptions: true,
    },
  });
  if (!org) return reply.code(404).send({ error: "Organization not found" });
  return org;
});

app.get("/orgs/members", { preHandler: authenticate }, async (request) => {
  return prisma.organizationMember.findMany({
    where: { orgId: request.user!.orgId },
    include: { user: { select: { id: true, email: true, displayName: true } } },
    orderBy: { joinedAt: "asc" },
  });
});

app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
