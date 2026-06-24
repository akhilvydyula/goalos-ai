import type {
  DnaAnswers,
  ProductivityIdentity,
  ProductivityProfile,
  ScoreBreakdown,
  TrackedApp,
  IntentCheckIn,
  FocusSprint,
} from "./types";

const WEIGHTS = {
  goalSupportingTime: 30,
  roadmapCompletion: 20,
  deepWork: 15,
  intentMatch: 15,
  wellnessBalance: 10,
  distractionPenalty: 20,
  lateNightPenalty: 10,
  contextSwitchPenalty: 10,
};

function minutesByClassification(apps: TrackedApp[]) {
  return apps.reduce(
    (acc, app) => {
      acc[app.classification] += app.minutesToday;
      return acc;
    },
    {
      "goal-supporting": 0,
      mixed: 0,
      neutral: 0,
      distracting: 0,
    }
  );
}

export function calculateGoalAlignmentScore(input: {
  apps: TrackedApp[];
  roadmapProgress: number;
  intentCheckIns: IntentCheckIn[];
  focusSprints: FocusSprint[];
  energyToday: number;
  moodToday: number;
}): ScoreBreakdown {
  const { apps, roadmapProgress, intentCheckIns, focusSprints, energyToday, moodToday } = input;
  const byClass = minutesByClassification(apps);
  const totalMinutes = apps.reduce((s, a) => s + a.minutesToday, 0) || 1;

  const goalSupportingRatio = byClass["goal-supporting"] / totalMinutes;
  const goalSupportingTime = Math.round(goalSupportingRatio * WEIGHTS.goalSupportingTime);

  const roadmapCompletion = Math.round((roadmapProgress / 100) * WEIGHTS.roadmapCompletion);

  const completedSprints = focusSprints.filter((s) => s.completedAt).length;
  const deepWorkMinutes = completedSprints * 25 + byClass["goal-supporting"] * 0.3;
  const deepWork = Math.min(
    WEIGHTS.deepWork,
    Math.round((deepWorkMinutes / 120) * WEIGHTS.deepWork)
  );

  const alignedIntents = intentCheckIns.filter((c) => c.aligned).length;
  const intentTotal = intentCheckIns.length || 1;
  const intentMatch = Math.round((alignedIntents / intentTotal) * WEIGHTS.intentMatch);

  const wellnessScore = ((energyToday + moodToday) / 10) * WEIGHTS.wellnessBalance;
  const wellnessBalance = Math.round(wellnessScore);

  const distractionRatio = (byClass.distracting + byClass.mixed * 0.5) / totalMinutes;
  const distractionPenalty = Math.round(distractionRatio * WEIGHTS.distractionPenalty);

  const lateNightMinutes = apps
    .filter((a) => a.lastOpenedHour >= 22 || a.lastOpenedHour < 5)
    .reduce((s, a) => s + a.minutesToday, 0);
  const lateNightRatio = lateNightMinutes / totalMinutes;
  const lateNightPenalty = Math.round(lateNightRatio * WEIGHTS.lateNightPenalty);

  const totalSessions = apps.reduce((s, a) => s + a.sessions, 0);
  const contextSwitchRatio = Math.min(1, totalSessions / 40);
  const contextSwitchPenalty = Math.round(contextSwitchRatio * WEIGHTS.contextSwitchPenalty);

  const raw =
    goalSupportingTime +
    roadmapCompletion +
    deepWork +
    intentMatch +
    wellnessBalance -
    distractionPenalty -
    lateNightPenalty -
    contextSwitchPenalty;

  const total = Math.max(0, Math.min(100, raw));

  return {
    goalSupportingTime,
    roadmapCompletion,
    deepWork,
    intentMatch,
    wellnessBalance,
    distractionPenalty: -distractionPenalty,
    lateNightPenalty: -lateNightPenalty,
    contextSwitchPenalty: -contextSwitchPenalty,
    total,
  };
}

export function deriveProductivityProfile(dna: DnaAnswers): ProductivityProfile {
  let identity: ProductivityIdentity = "Consistent Builder";

  if (dna.distractionTime === "Late night" || dna.goalBlocker === "Night scrolling") {
    identity = "Night Scroller";
  } else if (dna.goalBlocker === "Too much content, not enough action") {
    identity = "High Potential, Low Execution";
  } else if (dna.goalBlocker === "Context switching") {
    identity = "Dopamine Drifter";
  } else if (dna.bestFocusTime.startsWith("Early") || dna.bestFocusTime.startsWith("Morning")) {
    identity = "Focused Creator";
  }

  const reminderStrategy =
    identity === "Night Scroller"
      ? "Night guard reminders before 10pm"
      : identity === "High Potential, Low Execution"
        ? "Short 15–25 min focus sprints"
        : "Best focus window nudges";

  return {
    identity,
    distractionTrigger: dna.distractionTrigger,
    focusWindow: dna.bestFocusTime,
    coachingTone: dna.coachingTone,
    reminderStrategy,
  };
}

export function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-rose-400";
}

export function scoreGradient(score: number): string {
  if (score >= 80) return "from-emerald-500/20 to-teal-500/10";
  if (score >= 60) return "from-amber-500/20 to-orange-500/10";
  return "from-rose-500/20 to-pink-500/10";
}
