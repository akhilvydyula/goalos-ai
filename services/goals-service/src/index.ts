import { prisma } from "@goalos/database";
import { authPreHandler, canWriteProductData, getEnv, goalSchema } from "@goalos/shared";
import Fastify from "fastify";

const PORT = Number(process.env.PORT ?? 4002);
const JWT_SECRET = getEnv("JWT_SECRET", "dev-secret-change-me");
const SERVICE = "goals-service";
const VERSION = "0.1.0";

const app = Fastify({ logger: true });
const authenticate = authPreHandler(JWT_SECRET);

app.get("/health", async () => ({
  service: SERVICE,
  status: "ok" as const,
  version: VERSION,
  timestamp: new Date().toISOString(),
}));

app.get("/goals/active", { preHandler: authenticate }, async (request, reply) => {
  const goal = await prisma.goal.findFirst({
    where: { orgId: request.user!.orgId, active: true },
    include: { milestones: { orderBy: { week: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
  if (!goal) return reply.code(404).send({ error: "No active goal" });
  return goal;
});

app.post("/goals", { preHandler: authenticate }, async (request, reply) => {
  if (!canWriteProductData(request.user!.role)) {
    return reply.code(403).send({ error: "Insufficient permissions" });
  }

  const parsed = goalSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: "Invalid goal payload", details: parsed.error.flatten() });
  }

  await prisma.goal.updateMany({
    where: { orgId: request.user!.orgId, active: true },
    data: { active: false },
  });

  const goal = await prisma.goal.create({
    data: {
      orgId: request.user!.orgId,
      ...parsed.data,
      milestones: {
        create: Array.from({ length: Math.min(parsed.data.timelineWeeks, 12) }, (_, i) => ({
          week: i + 1,
          title: `Week ${i + 1}: ${parsed.data.title}`,
          minutesPerDay: parsed.data.dailyCommitmentMinutes,
        })),
      },
    },
    include: { milestones: true },
  });

  await prisma.auditLog.create({
    data: {
      orgId: request.user!.orgId,
      userId: request.user!.sub,
      action: "goal.create",
      resource: goal.id,
    },
  });

  return reply.code(201).send(goal);
});

app.patch("/goals/:id/roadmap/:milestoneId", { preHandler: authenticate }, async (request, reply) => {
  if (!canWriteProductData(request.user!.role)) {
    return reply.code(403).send({ error: "Insufficient permissions" });
  }

  const { id, milestoneId } = request.params as { id: string; milestoneId: string };
  const body = request.body as { completed?: boolean };

  const milestone = await prisma.roadmapMilestone.findFirst({
    where: { id: milestoneId, goalId: id, goal: { orgId: request.user!.orgId } },
  });
  if (!milestone) return reply.code(404).send({ error: "Milestone not found" });

  const updated = await prisma.roadmapMilestone.update({
    where: { id: milestoneId },
    data: { completed: body.completed ?? true },
  });

  const milestones = await prisma.roadmapMilestone.findMany({ where: { goalId: id } });
  const progress = milestones.length
    ? Math.round((milestones.filter((m: { completed: boolean }) => m.completed).length / milestones.length) * 100)
    : 0;
  await prisma.goal.update({ where: { id }, data: { roadmapProgress: progress } });

  return updated;
});

app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
