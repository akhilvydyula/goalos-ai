export type GoalTemplate =
  | "data-engineering-job"
  | "software-interview"
  | "learn-ai-de"
  | "reduce-social-media"
  | "founder-mode";

export type AppClassification =
  | "goal-supporting"
  | "mixed"
  | "neutral"
  | "distracting";

export * from "./types.js";
export * from "./scoring.js";
export * from "./auth.js";
export * from "./validation.js";
export * from "./server.js";
