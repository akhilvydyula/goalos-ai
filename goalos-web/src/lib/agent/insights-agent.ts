import type { ProductivityIdentity, ScoreBreakdown, TrackedApp, WeeklyReport } from "../types";
import { formatMinutes } from "../demo-data";

export function enrichWeeklyReport(input: {
  base: WeeklyReport;
  score: ScoreBreakdown;
  apps: TrackedApp[];
  identity: ProductivityIdentity;
  goalTitle: string;
  weeklyHistory: number[];
}): WeeklyReport {
  const { base, score, apps, identity, goalTitle, weeklyHistory } = input;

  const topDistractor = [...apps]
    .filter((a) => a.classification === "distracting" || a.classification === "mixed")
    .sort((a, b) => b.minutesToday - a.minutesToday)[0];

  const trend =
    weeklyHistory.length >= 2
      ? weeklyHistory[weeklyHistory.length - 1] - weeklyHistory[weeklyHistory.length - 2]
      : 0;

  const riskWindow =
    identity === "Night Scroller" || score.lateNightPenalty < -5
      ? "10pm – 12am"
      : "8pm – 10pm";

  const bestFocusWindow =
    identity === "Deep Worker" || identity === "Focused Creator"
      ? "9am – 12pm"
      : identity === "Night Scroller"
        ? "7am – 9am"
        : "9am – 11am";

  const distractionReductionPercent =
    weeklyHistory.length >= 2 && trend > 0
      ? Math.min(40, trend)
      : 0;

  const coachLetter = buildCoachLetter({
    identity,
    goalTitle,
    averageScore: base.averageScore,
    trend,
    topDistractor: topDistractor?.name,
    pointsTo80: Math.max(0, 80 - score.total),
  });

  const nextWeekGoal =
    base.averageScore >= 85
      ? `Maintain 85+ while advancing ${goalTitle} roadmap milestones.`
      : trend >= 0
        ? `Push average score to ${Math.min(90, base.averageScore + 8)}+ with daily ${topDistractor ? `Intent Gate on ${topDistractor.name}` : "focus sprints"}.`
        : `Recover momentum: 3 focus sprints before ${topDistractor?.name ?? "entertainment apps"} each day.`;

  return {
    ...base,
    bestFocusWindow,
    riskWindow,
    distractionReductionPercent,
    nextWeekGoal,
    coachLetter,
  };
}

function buildCoachLetter(input: {
  identity: ProductivityIdentity;
  goalTitle: string;
  averageScore: number;
  trend: number;
  topDistractor?: string;
  pointsTo80: number;
}): string {
  const { identity, goalTitle, averageScore, trend, topDistractor, pointsTo80 } = input;

  const trendLine =
    trend > 3
      ? "Your score is climbing — protect the habits that got you here."
      : trend < -3
        ? "Scores dipped this week. One intentional sprint per day reverses this."
        : "Scores held steady — small upgrades to your evening routine unlock the next tier.";

  const identityLine =
    identity === "High Potential, Low Execution"
      ? "You consume great content; the agent layer will push you from learning to doing."
      : identity === "Night Scroller"
        ? "Night scrolling is your leak. Guard after 10pm and stack wins in the morning."
        : `As a ${identity}, your best leverage is consistent deep work on ${goalTitle}.`;

  const distractorLine = topDistractor
    ? `Watch ${topDistractor} — it's your highest-risk app this week.`
    : "Keep classifying mixed apps with Intent Gate.";

  const scoreLine =
    pointsTo80 > 0
      ? `You're ${pointsTo80} points from an 80+ day. One 25-minute sprint closes most of that gap.`
      : `You're averaging ${averageScore}/100 — excellent alignment for ${goalTitle}.`;

  return [trendLine, identityLine, distractorLine, scoreLine].join(" ");
}
