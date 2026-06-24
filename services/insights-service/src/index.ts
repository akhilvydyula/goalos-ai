import { prisma } from "@goalos/database";
import {
  authPreHandler,
  calculateGoalAlignmentScore,
  canWriteProductData,
  classificationToApi,
  focusSprintSchema,
  getEnv,
  intentCheckInSchema,
} from "@goalos/shared";
import Fastify from "fastify";

const PORT = Number(process.env.PORT ?? 4005);
const JWT_SECRET = getEnv("JWT_SECRET", "dev-secret-change-me");
const SERVICE = "insights-service";
const VERSION = "0.1.0";

const app = Fastify({ logger: true });
const authenticate = authPreHandler(JWT_SECRET);

function startOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function loadScoreInputs(orgId: string) {
  const [goal, apps, intents, sprints] = await Promise.all([
    prisma.goal.findFirst({ where: { orgId, active: true } }),
    prisma.trackedApp.findMany({ where: { orgId } }),
    prisma.intentCheckIn.findMany({ where: { orgId, createdAt: { gte: startOfDay() } } }),
    prisma.focusSprint.findMany({ where: { orgId, createdAt: { gte: startOfDay() } } }),
  ]);

  const breakdown = calculateGoalAlignmentScore({
    apps: apps.map((a) => ({
      classification: classificationToApi(a.classification),
      minutesToday: a.minutesToday,
      sessions: a.sessions,
      lastOpenedHour: a.lastOpenedHour,
    })),
    roadmapProgress: goal?.roadmapProgress ?? 0,
    intentCheckIns: intents,
    focusSprints: sprints,
    energyToday: goal?.energyToday ?? 7,
    moodToday: goal?.moodToday ?? 7,
  });

  return { goal, apps, breakdown };
}

app.get("/health", async () => ({
  service: SERVICE,
  status: "ok" as const,
  version: VERSION,
  timestamp: new Date().toISOString(),
}));

app.get("/insights/score", { preHandler: authenticate }, async (request) => {
  const { breakdown } = await loadScoreInputs(request.user!.orgId);
  return breakdown;
});

app.post("/insights/score/snapshot", { preHandler: authenticate }, async (request, reply) => {
  if (!canWriteProductData(request.user!.role)) {
    return reply.code(403).send({ error: "Insufficient permissions" });
  }

  const { breakdown } = await loadScoreInputs(request.user!.orgId);
  const snapshot = await prisma.scoreSnapshot.create({
    data: {
      orgId: request.user!.orgId,
      total: breakdown.total,
      breakdown: { ...breakdown },
    },
  });
  return reply.code(201).send(snapshot);
});

app.get("/insights/weekly", { preHandler: authenticate }, async (request) => {
  const orgId = request.user!.orgId;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [snapshots, apps, goal] = await Promise.all([
    prisma.scoreSnapshot.findMany({
      where: { orgId, createdAt: { gte: weekAgo } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.trackedApp.findMany({ where: { orgId } }),
    prisma.goal.findFirst({ where: { orgId, active: true } }),
  ]);

  const avg =
    snapshots.length > 0
      ? Math.round(snapshots.reduce((s, x) => s + x.total, 0) / snapshots.length)
      : (await loadScoreInputs(orgId)).breakdown.total;

  const productive = apps
    .filter((a) => a.classification === "GOAL_SUPPORTING")
    .reduce((s, a) => s + a.minutesToday, 0);
  const distracted = apps
    .filter((a) => a.classification === "DISTRACTING" || a.classification === "MIXED")
    .reduce((s, a) => s + a.minutesToday, 0);

  return {
    weekLabel: "This week",
    averageScore: avg,
    productiveMinutes: productive,
    distractedMinutes: distracted,
    bestFocusWindow: goal?.focusWindow ?? "Morning",
    riskWindow: "Late night",
    identity: "Focused Creator",
    nextWeekGoal: goal?.title ?? "Protect focus windows",
    distractionReductionPercent: distracted > 0 ? 15 : 0,
    coachLetter: `You averaged ${avg}/100 this week. Double down on ${goal?.focusWindow ?? "your focus window"} for ${goal?.title ?? "your goal"}.`,
  };
});

app.post("/insights/intent-checkins", { preHandler: authenticate }, async (request, reply) => {
  if (!canWriteProductData(request.user!.role)) {
    return reply.code(403).send({ error: "Insufficient permissions" });
  }

  const parsed = intentCheckInSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: "Invalid intent check-in" });
  }

  const record = await prisma.intentCheckIn.create({
    data: { orgId: request.user!.orgId, ...parsed.data },
  });
  return reply.code(201).send(record);
});

app.post("/insights/focus-sprints", { preHandler: authenticate }, async (request, reply) => {
  if (!canWriteProductData(request.user!.role)) {
    return reply.code(403).send({ error: "Insufficient permissions" });
  }

  const parsed = focusSprintSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: "Invalid focus sprint" });
  }

  const sprint = await prisma.focusSprint.create({
    data: {
      orgId: request.user!.orgId,
      title: parsed.data.title,
      durationMinutes: parsed.data.durationMinutes,
      startedAt: new Date(),
    },
  });
  return reply.code(201).send(sprint);
});

app.post("/insights/focus-sprints/:id/complete", { preHandler: authenticate }, async (request, reply) => {
  if (!canWriteProductData(request.user!.role)) {
    return reply.code(403).send({ error: "Insufficient permissions" });
  }

  const { id } = request.params as { id: string };
  const sprint = await prisma.focusSprint.findFirst({
    where: { id, orgId: request.user!.orgId },
  });
  if (!sprint) return reply.code(404).send({ error: "Sprint not found" });

  return prisma.focusSprint.update({
    where: { id },
    data: { completedAt: new Date(), scoreBoost: 8 },
  });
});

app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
