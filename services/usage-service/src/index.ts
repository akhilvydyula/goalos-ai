import { prisma } from "@goalos/database";
import {
  authPreHandler,
  canWriteProductData,
  classificationFromApi,
  classificationToApi,
  getEnv,
  usageBatchSchema,
} from "@goalos/shared";
import Fastify from "fastify";

const PORT = Number(process.env.PORT ?? 4003);
const JWT_SECRET = getEnv("JWT_SECRET", "dev-secret-change-me");
const SERVICE = "usage-service";
const VERSION = "0.1.0";

const app = Fastify({ logger: true });
const authenticate = authPreHandler(JWT_SECRET);

app.get("/health", async () => ({
  service: SERVICE,
  status: "ok" as const,
  version: VERSION,
  timestamp: new Date().toISOString(),
}));

app.get("/usage/apps/today", { preHandler: authenticate }, async (request) => {
  const apps = await prisma.trackedApp.findMany({
    where: { orgId: request.user!.orgId },
    orderBy: { minutesToday: "desc" },
  });
  return apps.map((app) => ({
    ...app,
    classification: classificationToApi(app.classification),
  }));
});

app.post("/usage/events", { preHandler: authenticate }, async (request, reply) => {
  if (!canWriteProductData(request.user!.role)) {
    return reply.code(403).send({ error: "Insufficient permissions" });
  }

  const parsed = usageBatchSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: "Invalid usage batch", details: parsed.error.flatten() });
  }

  const orgId = request.user!.orgId;
  const results = [];

  for (const event of parsed.data.events) {
    const recordedAt = event.recordedAt ? new Date(event.recordedAt) : new Date();
    const created = await prisma.usageEvent.create({
      data: {
        orgId,
        packageName: event.packageName,
        appName: event.appName,
        classification: classificationFromApi(event.classification),
        minutes: event.minutes,
        sessions: event.sessions ?? 1,
        lastOpenedHour: event.lastOpenedHour,
        recordedAt,
      },
    });

    await prisma.trackedApp.upsert({
      where: { orgId_packageName: { orgId, packageName: event.packageName } },
      create: {
        orgId,
        name: event.appName,
        packageName: event.packageName,
        classification: classificationFromApi(event.classification),
        minutesToday: event.minutes,
        sessions: event.sessions ?? 1,
        lastOpenedHour: event.lastOpenedHour ?? 12,
      },
      update: {
        name: event.appName,
        classification: classificationFromApi(event.classification),
        minutesToday: { increment: event.minutes },
        sessions: { increment: event.sessions ?? 1 },
        lastOpenedHour: event.lastOpenedHour ?? 12,
      },
    });

    results.push(created);
  }

  return reply.code(202).send({ ingested: results.length, events: results });
});

app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
