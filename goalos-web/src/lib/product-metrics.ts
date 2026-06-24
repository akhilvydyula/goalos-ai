import type { ScoreBreakdown, TrackedApp, UserState } from "./types";
import { formatMinutes } from "./demo-data";

export function minutesByAlignment(apps: TrackedApp[]) {
  let productive = 0;
  let distracted = 0;
  let mixed = 0;
  for (const app of apps) {
    if (app.classification === "goal-supporting") productive += app.minutesToday;
    else if (app.classification === "distracting") distracted += app.minutesToday;
    else if (app.classification === "mixed") mixed += app.minutesToday;
  }
  return { productive, distracted, mixed, neutral: apps.filter(a => a.classification === "neutral").reduce((s, a) => s + a.minutesToday, 0) };
}

export function deriveRiskWindow(state: UserState): string {
  const dna = state.dna?.distractionTime;
  if (dna === "Late night") return "9:00 PM – 12:00 AM";
  if (dna === "Evening") return "6:00 PM – 9:00 PM";
  if (dna === "Afternoon") return "2:00 PM – 5:00 PM";
  if (state.profile?.identity === "Night Scroller") return "9:00 PM – 12:00 AM";
  const lateApps = state.apps.filter((a) => a.lastOpenedHour >= 21 && a.minutesToday > 0);
  if (lateApps.length > 0) return "9:00 PM – 12:00 AM";
  return "6:00 PM – 9:00 PM";
}

export function deriveBestFocusWindow(state: UserState): string {
  return state.profile?.focusWindow ?? state.dna?.bestFocusTime ?? "8:00 AM – 10:00 AM";
}

export type ScoreInsight = { label: string; points: number };

export function scoreHelpedAndHurt(score: ScoreBreakdown): {
  helped: ScoreInsight[];
  hurt: ScoreInsight[];
} {
  const helped: ScoreInsight[] = [
    { label: "Goal-supporting time", points: score.goalSupportingTime },
    { label: "Roadmap progress", points: score.roadmapCompletion },
    { label: "Deep work", points: score.deepWork },
    { label: "Intent alignment", points: score.intentMatch },
    { label: "Wellness balance", points: score.wellnessBalance },
  ].filter((x) => x.points > 0);

  const hurt: ScoreInsight[] = [
    { label: "Distraction", points: score.distractionPenalty },
    { label: "Late-night usage", points: score.lateNightPenalty },
    { label: "Context switching", points: score.contextSwitchPenalty },
  ].filter((x) => x.points < 0);

  helped.sort((a, b) => b.points - a.points);
  hurt.sort((a, b) => a.points - b.points);
  return { helped, hurt };
}

export function formatProductiveSummary(apps: TrackedApp[]) {
  const { productive, distracted, mixed } = minutesByAlignment(apps);
  return {
    productive,
    distracted: distracted + Math.round(mixed * 0.5),
    goalTimeLabel: formatMinutes(productive),
    distractTimeLabel: formatMinutes(distracted + mixed),
  };
}
