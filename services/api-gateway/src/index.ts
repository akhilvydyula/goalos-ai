import { authPreHandler, getEnv } from "@goalos/shared";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import httpProxy from "@fastify/http-proxy";
import openApiSpec from "./openapi.json" with { type: "json" };

const PORT = Number(process.env.PORT ?? 4000);
const JWT_SECRET = getEnv("JWT_SECRET", "dev-secret-change-me");
const SERVICE = "api-gateway";
const VERSION = "0.2.0";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

const AUTH_URL = getEnv("AUTH_SERVICE_URL", "http://127.0.0.1:4001");
const GOALS_URL = getEnv("GOALS_SERVICE_URL", "http://127.0.0.1:4002");
const USAGE_URL = getEnv("USAGE_SERVICE_URL", "http://127.0.0.1:4003");
const COACH_URL = getEnv("COACH_SERVICE_URL", "http://127.0.0.1:4004");
const INSIGHTS_URL = getEnv("INSIGHTS_SERVICE_URL", "http://127.0.0.1:4005");

const app = Fastify({
  logger: true,
  requestIdHeader: "x-request-id",
  genReqId: () => crypto.randomUUID(),
});

await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, {
  origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(","),
  credentials: true,
});
await app.register(rateLimit, {
  max: Number(process.env.RATE_LIMIT_MAX ?? 200),
  timeWindow: "1 minute",
});

const authenticate = authPreHandler(JWT_SECRET);

app.addHook("onSend", async (request, reply, payload) => {
  reply.header("x-request-id", request.id);
  return payload;
});

app.get("/health", async () => ({
  service: SERVICE,
  status: "ok" as const,
  version: VERSION,
  timestamp: new Date().toISOString(),
}));

app.get("/v1/openapi.json", async () => openApiSpec);

app.get("/v1/health/services", async () => {
  const targets = [
    { name: "auth", url: AUTH_URL },
    { name: "goals", url: GOALS_URL },
    { name: "usage", url: USAGE_URL },
    { name: "coach", url: COACH_URL },
    { name: "insights", url: INSIGHTS_URL },
  ];

  const results = await Promise.all(
    targets.map(async (t) => {
      try {
        const res = await fetch(`${t.url}/health`);
        return { name: t.name, ok: res.ok, ...(await res.json()) };
      } catch {
        return { name: t.name, ok: false, status: "down" };
      }
    })
  );

  const allOk = results.every((r) => r.ok);
  return {
    gateway: SERVICE,
    status: allOk ? "ok" : "degraded",
    services: results,
  };
});

await app.register(httpProxy, {
  upstream: AUTH_URL,
  prefix: "/v1/auth",
  rewritePrefix: "/auth",
});

await app.register(httpProxy, {
  upstream: AUTH_URL,
  prefix: "/v1/orgs/invites/accept",
  rewritePrefix: "/orgs/invites/accept",
});

await app.register(
  async (instance) => {
    instance.addHook("preHandler", authenticate);
    const protectedProxies: Array<{ prefix: string; upstream: string; rewrite: string }> = [
      { prefix: "/v1/goals", upstream: GOALS_URL, rewrite: "/goals" },
      { prefix: "/v1/usage", upstream: USAGE_URL, rewrite: "/usage" },
      { prefix: "/v1/coach", upstream: COACH_URL, rewrite: "/coach" },
      { prefix: "/v1/insights", upstream: INSIGHTS_URL, rewrite: "/insights" },
      { prefix: "/v1/orgs", upstream: AUTH_URL, rewrite: "/orgs" },
      { prefix: "/v1/admin", upstream: AUTH_URL, rewrite: "/admin" },
      { prefix: "/v1/compliance", upstream: AUTH_URL, rewrite: "/compliance" },
      { prefix: "/v1/api-keys", upstream: AUTH_URL, rewrite: "/api-keys" },
      { prefix: "/v1/billing", upstream: AUTH_URL, rewrite: "/billing" },
      { prefix: "/v1/sso", upstream: AUTH_URL, rewrite: "/sso" },
    ];

    for (const proxy of protectedProxies) {
      await instance.register(httpProxy, {
        upstream: proxy.upstream,
        prefix: proxy.prefix,
        rewritePrefix: proxy.rewrite,
      });
    }
  },
  { prefix: "/" }
);

app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
