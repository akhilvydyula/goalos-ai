import { prisma } from "@goalos/database";
import {
  authPreHandler,
  calculateGoalAlignmentScore,
  canWriteProductData,
  classificationToApi,
  coachChatSchema,
  getEnv,
} from "@goalos/shared";
import Fastify from "fastify";

const PORT = Number(process.env.PORT ?? 4004);
const JWT_SECRET = getEnv("JWT_SECRET", "dev-secret-change-me");
const SERVICE = "coach-service";
const VERSION = "0.1.0";

const app = Fastify({ logger: true });
const authenticate = authPreHandler(JWT_SECRET);

function buildRecommendation(score: number, goalTitle?: string) {
  const title = goalTitle ?? "your goal";
  if (score >= 80) {
    return {
      diagnosis: "Strong alignment today. You're protecting focus time well.",
      nextAction: `Schedule tomorrow's top task for ${title} before noon.`,
      reminder: "Keep intent gates on for mixed apps.",
      tomorrowPlan: "One 25-minute sprint on your highest-leverage task.",
      scoreContext: score,
    };
  }
  if (score >= 60) {
    return {
      diagnosis: "Decent progress, but distraction windows are still open.",
      nextAction: "Start a 25-minute focus sprint on your roadmap task.",
      reminder: "Pause before opening entertainment apps.",
      tomorrowPlan: "Block 45 minutes in your best focus window.",
      scoreContext: score,
    };
  }
  return {
    diagnosis: "Score is low — reactive usage is winning over intentional work.",
    nextAction: "Log one aligned session and complete a short focus sprint.",
    reminder: "Use the intent gate before every distracting app.",
    tomorrowPlan: "Reduce distracting minutes by 20% with night guard reminders.",
    scoreContext: score,
  };
}

function coachReply(message: string, score: number, goalTitle?: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("score") || lower.includes("alignment")) {
    return `Your alignment score is ${score}/100. ${score >= 70 ? "Solid momentum — protect your focus window." : "Let's win the next hour: one sprint, one aligned task."}`;
  }
  if (lower.includes("sprint") || lower.includes("focus")) {
    return "Start a 25-minute sprint on your highest-leverage task. Close chat tabs and set one clear outcome.";
  }
  if (lower.includes("distract") || lower.includes("scroll")) {
    return "Before opening that app, name your intent in one sentence. If it's not aligned with " + (goalTitle ?? "your goal") + ", skip it.";
  }
  return `Focused on ${goalTitle ?? "your goal"}: pick one 25-minute task, run a sprint, then check your score again.`;
}

app.get("/health", async () => ({
  service: SERVICE,
  status: "ok" as const,
  version: VERSION,
  timestamp: new Date().toISOString(),
}));

app.get("/coach/recommendation", { preHandler: authenticate }, async (request) => {
  const orgId = request.user!.orgId;
  const [goal, apps, intents, sprints] = await Promise.all([
    prisma.goal.findFirst({ where: { orgId, active: true } }),
    prisma.trackedApp.findMany({ where: { orgId } }),
    prisma.intentCheckIn.findMany({ where: { orgId, createdAt: { gte: startOfDay() } } }),
    prisma.focusSprint.findMany({ where: { orgId, createdAt: { gte: startOfDay() } } }),
  ]);

  const score = calculateGoalAlignmentScore({
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

  return buildRecommendation(score.total, goal?.title);
});

app.get("/coach/messages", { preHandler: authenticate }, async (request) => {
  return prisma.coachMessage.findMany({
    where: { orgId: request.user!.orgId },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
});

app.post("/coach/chat", { preHandler: authenticate }, async (request, reply) => {
  if (!canWriteProductData(request.user!.role)) {
    return reply.code(403).send({ error: "Insufficient permissions" });
  }

  const parsed = coachChatSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: "Invalid chat payload" });
  }

  const orgId = request.user!.orgId;
  const [goal, apps, intents, sprints] = await Promise.all([
    prisma.goal.findFirst({ where: { orgId, active: true } }),
    prisma.trackedApp.findMany({ where: { orgId } }),
    prisma.intentCheckIn.findMany({ where: { orgId, createdAt: { gte: startOfDay() } } }),
    prisma.focusSprint.findMany({ where: { orgId, createdAt: { gte: startOfDay() } } }),
  ]);

  const score = calculateGoalAlignmentScore({
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

  await prisma.coachMessage.create({
    data: { orgId, role: "user", text: parsed.data.message },
  });

  const replyText = coachReply(parsed.data.message, score.total, goal?.title);
  const coachMessage = await prisma.coachMessage.create({
    data: { orgId, role: "coach", text: replyText },
  });

  return { message: coachMessage, score: score.total };
});

function startOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
