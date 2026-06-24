import { authPreHandler, getEnv } from "@goalos/shared";
import Fastify from "fastify";
import httpProxy from "@fastify/http-proxy";

const PORT = Number(process.env.PORT ?? 4000);
const JWT_SECRET = getEnv("JWT_SECRET", "dev-secret-change-me");
const SERVICE = "api-gateway";
const VERSION = "0.1.0";

const AUTH_URL = getEnv("AUTH_SERVICE_URL", "http://127.0.0.1:4001");
const GOALS_URL = getEnv("GOALS_SERVICE_URL", "http://127.0.0.1:4002");
const USAGE_URL = getEnv("USAGE_SERVICE_URL", "http://127.0.0.1:4003");
const COACH_URL = getEnv("COACH_SERVICE_URL", "http://127.0.0.1:4004");
const INSIGHTS_URL = getEnv("INSIGHTS_SERVICE_URL", "http://127.0.0.1:4005");

const app = Fastify({ logger: true });
const authenticate = authPreHandler(JWT_SECRET);

app.get("/health", async () => ({
  service: SERVICE,
  status: "ok" as const,
  version: VERSION,
  timestamp: new Date().toISOString(),
}));

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

  return { gateway: SERVICE, services: results };
});

await app.register(httpProxy, {
  upstream: AUTH_URL,
  prefix: "/v1/auth",
  rewritePrefix: "/auth",
});

await app.register(
  async (instance) => {
    instance.addHook("preHandler", authenticate);
    await instance.register(httpProxy, {
      upstream: GOALS_URL,
      prefix: "/v1/goals",
      rewritePrefix: "/goals",
    });
    await instance.register(httpProxy, {
      upstream: USAGE_URL,
      prefix: "/v1/usage",
      rewritePrefix: "/usage",
    });
    await instance.register(httpProxy, {
      upstream: COACH_URL,
      prefix: "/v1/coach",
      rewritePrefix: "/coach",
    });
    await instance.register(httpProxy, {
      upstream: INSIGHTS_URL,
      prefix: "/v1/insights",
      rewritePrefix: "/insights",
    });
    await instance.register(httpProxy, {
      upstream: AUTH_URL,
      prefix: "/v1/orgs",
      rewritePrefix: "/orgs",
    });
  },
  { prefix: "/" }
);

app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
