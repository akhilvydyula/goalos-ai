import type {
  CoachRecommendation,
  IntentReason,
  ScoreBreakdown,
  UserState,
} from "../types";

export type AgentToolName =
  | "start_focus_sprint"
  | "open_intent_gate"
  | "show_tomorrow_plan"
  | "navigate_insights"
  | "navigate_goal"
  | "generate_roadmap";

export interface AgentToolCall {
  tool: AgentToolName;
  params: Record<string, string | number | boolean>;
}

export interface SprintPrefill {
  title: string;
  durationMinutes: number;
  dsaProblemId?: string;
}

export interface AgentActionResult {
  replySuffix?: string;
  sprintPrefill?: SprintPrefill;
  intentAppId?: string;
  navigateTab?: "insights" | "goal" | "today" | "coach" | "you";
  statePatch?: Partial<UserState>;
}

export interface AgentRouteResult {
  toolCalls: AgentToolCall[];
  actionResults: AgentActionResult[];
  combinedReplySuffix: string;
}

export interface AgentContext {
  state: UserState;
  score: ScoreBreakdown;
  coach: CoachRecommendation;
  userMessage: string;
}

export interface IntentClassification {
  reason: IntentReason;
  aligned: boolean;
  confidence: "high" | "medium" | "low";
  explanation: string;
}
