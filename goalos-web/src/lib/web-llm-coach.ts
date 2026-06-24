import type { CoachRecommendation, CoachMessage, ScoreBreakdown, UserState } from "./types";
import { formatMinutes } from "./demo-data";
import { replyTo } from "./coach";
import type { MLCEngineInterface } from "@mlc-ai/web-llm";

/** Smallest prebuilt model — ~600MB first download, cached in browser after. */
export const WEB_LLM_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

export type WebLLMStatus =
  | "checking"
  | "idle"
  | "loading"
  | "ready"
  | "error"
  | "unsupported";

export async function checkWebGPUSupport(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("gpu" in navigator)) return false;
  try {
    const gpu = navigator.gpu as { requestAdapter: () => Promise<unknown | null> } | undefined;
    if (!gpu) return false;
    const adapter = await gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

export function buildCoachSystemPrompt(
  state: UserState,
  score: ScoreBreakdown,
  coach: CoachRecommendation
): string {
  const distractor = [...state.apps]
    .filter((a) => a.classification === "distracting" || a.classification === "mixed")
    .sort((a, b) => b.minutesToday - a.minutesToday)[0];

  return `You are GoalOS AI Coach — a concise, motivating productivity coach.
Turn screen time into goal time. Be direct, warm, and actionable. Keep replies under 120 words.

User context:
- Goal: ${state.goal?.title ?? "Not set"}
- Productivity identity: ${state.profile?.identity ?? "Unknown"}
- Focus window: ${state.profile?.focusWindow ?? "Morning"}
- Goal Alignment Score today: ${score.total}/100
- Diagnosis: ${coach.diagnosis}
- Next best action: ${coach.nextAction}
- Reminder: ${coach.reminder}
- Top distractor app: ${distractor ? `${distractor.name} (${formatMinutes(distractor.minutesToday)} today)` : "none"}
- Roadmap progress: ${state.roadmapProgress}%

Give practical coaching: focus sprints, intent gates, night scrolling guards, tomorrow plans.
Never mention API keys, servers, or that you are a language model.`;
}

let enginePromise: Promise<MLCEngineInterface> | null = null;
let loadProgressCallback: ((progress: number, text: string) => void) | undefined;

export async function loadWebLLMEngine(
  onProgress?: (progress: number, text: string) => void
): Promise<MLCEngineInterface> {
  const supported = await checkWebGPUSupport();
  if (!supported) {
    throw new Error("WebGPU is not supported. Use Chrome or Edge on desktop.");
  }

  if (onProgress) loadProgressCallback = onProgress;

  if (!enginePromise) {
    enginePromise = (async () => {
      const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
      return CreateMLCEngine(WEB_LLM_MODEL, {
        initProgressCallback: (report) => {
          loadProgressCallback?.(report.progress, report.text);
        },
      });
    })().catch((err) => {
      enginePromise = null;
      throw err;
    });
  }

  return enginePromise;
}

export function resetWebLLMEngine(): void {
  enginePromise = null;
  loadProgressCallback = undefined;
}

export async function generateCoachReplyWithWebLLM(input: {
  state: UserState;
  score: ScoreBreakdown;
  coach: CoachRecommendation;
  history: CoachMessage[];
  userMessage: string;
  onProgress?: (progress: number, text: string) => void;
}): Promise<string> {
  const { state, score, coach, history, userMessage, onProgress } = input;

  const engine = await loadWebLLMEngine(onProgress);
  const systemPrompt = buildCoachSystemPrompt(state, score, coach);

  const recent = history.slice(-8).map((m) => ({
    role: (m.role === "coach" ? "assistant" : "user") as "assistant" | "user",
    content: m.text,
  }));

  const response = await engine.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      ...recent,
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 220,
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Empty model response");
  }
  return text;
}

export function fallbackCoachReply(
  userMessage: string,
  state: UserState,
  score: ScoreBreakdown,
  coach: CoachRecommendation
): string {
  return replyTo(userMessage, state, score, coach);
}
