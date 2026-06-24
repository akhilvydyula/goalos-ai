import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyAccessToken } from "./auth.js";
import type { JwtPayload } from "./types.js";

export function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export function authPreHandler(jwtSecret: string) {
  return async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return reply.code(401).send({ error: "Missing bearer token" });
    }
    try {
      request.user = verifyAccessToken(header.slice(7), jwtSecret);
    } catch {
      return reply.code(401).send({ error: "Invalid or expired token" });
    }
  };
}

export function classificationToApi(
  value: string
): "goal-supporting" | "mixed" | "neutral" | "distracting" {
  const map: Record<string, "goal-supporting" | "mixed" | "neutral" | "distracting"> = {
    GOAL_SUPPORTING: "goal-supporting",
    MIXED: "mixed",
    NEUTRAL: "neutral",
    DISTRACTING: "distracting",
  };
  return map[value] ?? "neutral";
}

export function classificationFromApi(
  value: string
): "GOAL_SUPPORTING" | "MIXED" | "NEUTRAL" | "DISTRACTING" {
  const map: Record<string, "GOAL_SUPPORTING" | "MIXED" | "NEUTRAL" | "DISTRACTING"> = {
    "goal-supporting": "GOAL_SUPPORTING",
    mixed: "MIXED",
    neutral: "NEUTRAL",
    distracting: "DISTRACTING",
  };
  return map[value] ?? "NEUTRAL";
}
