import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(80).optional(),
  orgName: z.string().min(1).max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const goalSchema = z.object({
  template: z.enum([
    "data-engineering-job",
    "software-interview",
    "learn-ai-de",
    "reduce-social-media",
    "founder-mode",
  ]),
  title: z.string().min(1).max(200),
  timelineWeeks: z.number().int().min(1).max(104),
  dailyCommitmentMinutes: z.number().int().min(5).max(480),
  focusWindow: z.string().min(1).max(80),
  painPoint: z.string().max(500),
  motivation: z.string().max(500),
});

export const usageEventSchema = z.object({
  packageName: z.string().min(1).max(200),
  appName: z.string().min(1).max(120),
  classification: z.enum(["goal-supporting", "mixed", "neutral", "distracting"]),
  minutes: z.number().int().min(0).max(1440),
  sessions: z.number().int().min(0).max(500).optional(),
  lastOpenedHour: z.number().int().min(0).max(23).optional(),
  recordedAt: z.string().datetime().optional(),
});

export const usageBatchSchema = z.object({
  events: z.array(usageEventSchema).min(1).max(100),
});

export const coachChatSchema = z.object({
  message: z.string().min(1).max(4000),
});

export const focusSprintSchema = z.object({
  title: z.string().min(1).max(120),
  durationMinutes: z.number().int().min(5).max(180),
});

export const intentCheckInSchema = z.object({
  appId: z.string().uuid(),
  reason: z.string().min(1).max(80),
  aligned: z.boolean(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8).max(128).optional(),
  displayName: z.string().min(1).max(80).optional(),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(80),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

export const ssoConfigSchema = z.object({
  provider: z.enum(["oidc", "saml"]),
  issuerUrl: z.string().url(),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1).optional(),
  enabled: z.boolean().default(false),
});

export const switchOrgSchema = z.object({
  orgId: z.string().uuid(),
});

export const billingCheckoutSchema = z.object({
  plan: z.enum(["PRO", "ENTERPRISE"]),
  seats: z.number().int().min(1).max(500).optional(),
});
