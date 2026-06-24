import type { UserState } from "./types";
import { calculateGoalAlignmentScore } from "./scoring";

/** Persist score snapshot when it changes — keeps charts honest. */
export function withScoreSnapshot(state: UserState): UserState {
  const total = calculateGoalAlignmentScore({
    apps: state.apps,
    roadmapProgress: state.roadmapProgress,
    intentCheckIns: state.intentCheckIns,
    focusSprints: state.focusSprints,
    energyToday: state.energyToday,
    moodToday: state.moodToday,
  }).total;

  const last = state.weeklyHistory[state.weeklyHistory.length - 1];
  if (last === total) return state;

  return {
    ...state,
    weeklyHistory: [...state.weeklyHistory, total],
  };
}

export function primaryGoalAppId(state: UserState): string | undefined {
  const prefer: Record<string, string> = {
    "data-engineering-job": "Udemy",
    "software-interview": "LeetCode",
    "learn-ai-de": "ChatGPT",
    "founder-mode": "Notion",
    "reduce-social-media": "Notion",
  };
  const name = state.goal?.template ? prefer[state.goal.template] : undefined;
  if (name) {
    const match = state.apps.find((a) => a.name === name);
    if (match) return match.id;
  }
  return state.apps.find((a) => a.classification === "goal-supporting")?.id;
}

export function addAppMinutes(
  state: UserState,
  appId: string,
  minutes: number
): UserState {
  const hour = new Date().getHours();
  return withScoreSnapshot({
    ...state,
    apps: state.apps.map((a) =>
      a.id === appId
        ? {
            ...a,
            minutesToday: a.minutesToday + minutes,
            sessions: a.sessions + 1,
            lastOpenedHour: hour,
          }
        : a
    ),
  });
}
