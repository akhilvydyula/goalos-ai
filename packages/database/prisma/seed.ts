import { createHash, randomBytes, scryptSync } from "node:crypto";
import { PrismaClient, PlanTier } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo1234!";
const ORG_SLUG = "atopush-demo";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function upsertDemoUser(input: {
  email: string;
  displayName: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  orgId: string;
}) {
  const passwordHash = hashPassword(DEMO_PASSWORD);
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { displayName: input.displayName, passwordHash },
    });
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: existing.id, orgId: input.orgId },
    });
    if (membership) {
      await prisma.organizationMember.update({
        where: { id: membership.id },
        data: { role: input.role },
      });
    } else {
      await prisma.organizationMember.create({
        data: { userId: existing.id, orgId: input.orgId, role: input.role },
      });
    }
    return existing;
  }

  return prisma.user.create({
    data: {
      email: input.email,
      displayName: input.displayName,
      passwordHash,
      memberships: {
        create: { orgId: input.orgId, role: input.role },
      },
    },
  });
}

async function main() {
  console.log("Seeding GoalOS demo data…");

  const org = await prisma.organization.upsert({
    where: { slug: ORG_SLUG },
    create: {
      name: "Atopush Demo",
      slug: ORG_SLUG,
      plan: PlanTier.ENTERPRISE,
      subscriptions: { create: { status: "trialing", seatLimit: 25 } },
    },
    update: { name: "Atopush Demo", plan: PlanTier.ENTERPRISE },
  });

  const admin = await upsertDemoUser({
    email: "admin@demo.goalos",
    displayName: "Demo Admin",
    role: "OWNER",
    orgId: org.id,
  });

  await upsertDemoUser({
    email: "member@demo.goalos",
    displayName: "Demo Member",
    role: "MEMBER",
    orgId: org.id,
  });

  const existingGoal = await prisma.goal.findFirst({ where: { orgId: org.id, active: true } });
  if (!existingGoal) {
    await prisma.goal.create({
      data: {
        orgId: org.id,
        template: "build-product",
        title: "Ship GoalOS enterprise MVP",
        timelineWeeks: 8,
        dailyCommitmentMinutes: 90,
        focusWindow: "morning",
        painPoint: "Reactive screen time",
        motivation: "Build Atopush-ready platform",
        roadmapProgress: 42,
        energyToday: 8,
        moodToday: 7,
        active: true,
        milestones: {
          create: [
            { week: 1, title: "Auth + RBAC", minutesPerDay: 60, completed: true },
            { week: 2, title: "Admin console", minutesPerDay: 90, completed: true },
            { week: 3, title: "Coach API", minutesPerDay: 90, completed: false },
          ],
        },
      },
    });
  }

  const apps = [
    { name: "VS Code", packageName: "com.microsoft.vscode", classification: "GOAL_SUPPORTING" as const, minutesToday: 120 },
    { name: "Slack", packageName: "com.slack", classification: "MIXED" as const, minutesToday: 35 },
    { name: "YouTube", packageName: "com.google.youtube", classification: "DISTRACTING" as const, minutesToday: 28 },
  ];

  for (const app of apps) {
    await prisma.trackedApp.upsert({
      where: { orgId_packageName: { orgId: org.id, packageName: app.packageName } },
      create: { orgId: org.id, ...app },
      update: { minutesToday: app.minutesToday, classification: app.classification },
    });
  }

  const auditActions = [
    { action: "user.register", resource: "user" },
    { action: "org.create", resource: "organization" },
    { action: "members.invite", resource: "organization_member" },
    { action: "apikey.create", resource: "api_key" },
  ];

  const auditCount = await prisma.auditLog.count({ where: { orgId: org.id } });
  if (auditCount < 4) {
    for (const entry of auditActions) {
      await prisma.auditLog.create({
        data: {
          orgId: org.id,
          userId: admin.id,
          action: entry.action,
          resource: entry.resource,
          metadata: { seeded: true },
        },
      });
    }
  }

  const keyHash = createHash("sha256").update("demo-seed-key").digest("hex");
  const existingKey = await prisma.apiKey.findFirst({ where: { orgId: org.id, name: "Demo integration" } });
  if (!existingKey) {
    await prisma.apiKey.create({
      data: {
        orgId: org.id,
        name: "Demo integration",
        keyPrefix: "gos_demo",
        keyHash,
        createdBy: admin.id,
      },
    });
  }

  console.log("Demo credentials:");
  console.log("  Owner:  admin@demo.goalos / Demo1234!");
  console.log("  Member: member@demo.goalos / Demo1234!");
  console.log(`  Organization: ${org.name} (${org.slug})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
