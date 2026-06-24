import type {
  CoachRecommendation,
  CoachMessage,
  ProductivityProfile,
  ScoreBreakdown,
  TrackedApp,
  UserGoal,
  UserState,
  WeeklyReport,
  ProductivityIdentity,
} from "./types";
import { formatMinutes } from "./demo-data";

export function generateCoachRecommendation(input: {
  score: ScoreBreakdown;
  goal?: UserGoal;
  profile?: ProductivityProfile;
  apps: TrackedApp[];
}): CoachRecommendation {
  const { score, goal, profile, apps } = input;
  const topDistractor = [...apps]
    .filter((a) => a.classification === "distracting" || a.classification === "mixed")
    .sort((a, b) => b.minutesToday - a.minutesToday)[0];

  const topHelper = [...apps]
    .filter((a) => a.classification === "goal-supporting")
    .sort((a, b) => b.minutesToday - a.minutesToday)[0];

  const goalTitle = goal?.title ?? "your goal";
  const pointsTo80 = Math.max(0, 80 - score.total);

  let diagnosis = `Your Goal Alignment Score is ${score.total}. `;
  if (score.total >= 80) {
    diagnosis += "Strong alignment today — you're moving closer to your goal.";
  } else if (score.distractionPenalty < -8) {
    diagnosis += `Distraction time reduced your score by ${Math.abs(score.distractionPenalty)} points.`;
  } else if (score.lateNightPenalty < -5) {
    diagnosis += "Late-night usage is pulling your score down.";
  } else {
    diagnosis += "You're making progress, but there's room to align more time with your goal.";
  }

  const sprintType =
    goal?.template === "data-engineering-job"
      ? "SQL"
      : goal?.template === "software-interview"
        ? "DSA"
        : goal?.template === "founder-mode"
          ? "build"
          : "focus";

  const nextAction =
    pointsTo80 > 0
      ? `Complete one ${sprintType} sprint (${pointsTo80 <= 10 ? "15" : "25"} min) before opening ${topDistractor?.name ?? "distracting apps"} to reach 80+.`
      : `Protect your momentum with a ${sprintType} deep work block using ${topHelper?.name ?? "your learning apps"}.`;

  const reminder =
    profile?.identity === "Night Scroller"
      ? "Night scrolling has reduced your morning focus — set a 10pm guard tonight."
      : pointsTo80 > 0
        ? `You're ${pointsTo80 <= 10 ? "one sprint" : `${pointsTo80} points`} away from an 80+ score.`
        : "Your best focus window starts now — capitalize on today's momentum.";

  const tomorrowPlan = `Morning: 25-min ${sprintType} sprint. Afternoon: classify ${topDistractor?.name ?? "mixed apps"} intent before opening. Evening: review score for ${goalTitle}.`;

  return {
    diagnosis,
    nextAction,
    reminder,
    tomorrowPlan,
    scoreContext: score.total,
  };
}

export function generateWeeklyReport(input: {
  scores: number[];
  apps: TrackedApp[];
  identity: ProductivityIdentity;
  goalTitle: string;
}): WeeklyReport {
  const { scores, apps, identity, goalTitle } = input;
  const avg = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const productive = apps
    .filter((a) => a.classification === "goal-supporting")
    .reduce((s, a) => s + a.minutesToday, 0);

  const distracted = apps
    .filter((a) => a.classification === "distracting")
    .reduce((s, a) => s + a.minutesToday, 0);

  const trend =
    scores.length >= 2 ? scores[scores.length - 1] - scores[scores.length - 2] : 0;

  return {
    weekLabel: "This Week",
    averageScore: avg,
    productiveMinutes: productive,
    distractedMinutes: distracted,
    bestFocusWindow: "9am – 12pm",
    riskWindow: "10pm – 12am",
    identity,
    nextWeekGoal: `Reach 85+ average score for ${goalTitle}`,
    distractionReductionPercent: trend > 0 ? Math.min(40, trend) : 0,
  };
}

function topDistractor(apps: TrackedApp[]) {
  return [...apps]
    .filter((a) => a.classification === "distracting" || a.classification === "mixed")
    .sort((a, b) => b.minutesToday - a.minutesToday)[0];
}

function sprintType(goal?: UserGoal) {
  switch (goal?.template) {
    case "data-engineering-job":
      return "SQL";
    case "software-interview":
      return "DSA";
    case "founder-mode":
      return "build";
    default:
      return "focus";
  }
}

export function createCoachMessage(role: CoachMessage["role"], text: string): CoachMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    text,
    timestamp: new Date().toISOString(),
  };
}

export function openingMessages(
  state: UserState,
  score: ScoreBreakdown,
  coach: CoachRecommendation
): CoachMessage[] {
  const identity = state.profile?.identity ?? "Consistent Builder";
  const distractor = topDistractor(state.apps);

  const opener =
    identity === "Night Scroller" || score.lateNightPenalty < -5
      ? "You are not lazy. Your learning intent is strong, but your phone environment is still winning after 9 PM. Let's redesign that moment."
      : identity === "High Potential, Low Execution"
        ? "You consume strong learning content — the gap is converting it into daily execution blocks. That's fixable with one sprint at a time."
        : score.total >= 80
          ? `Strong alignment today. You're moving closer to ${state.goal?.title ?? "your goal"} — let's protect this momentum.`
          : coach.diagnosis;

  const messages: CoachMessage[] = [
    createCoachMessage("coach", opener),
    createCoachMessage("coach", `Next best action: ${coach.nextAction}`),
  ];

  if (distractor) {
    messages.push(
      createCoachMessage(
        "coach",
        `Watch ${distractor.name} — it used ${formatMinutes(distractor.minutesToday)} today. Use Intent Gate before opening it.`
      )
    );
  }

  return messages;
}

export function suggestedPrompts(state: UserState, scoreTotal?: number): string[] {
  const lastScore = scoreTotal ?? state.weeklyHistory[state.weeklyHistory.length - 1];
  const scoreLabel = lastScore !== undefined ? String(lastScore) : "your current";

  if (state.goal?.template === "software-interview") {
    return [
      "What DSA pattern should I practice today?",
      "How do I approach two-pointer problems?",
      "Explain dynamic programming for interviews",
      `Why is my score ${scoreLabel} today?`,
    ];
  }

  return [
    "What should I do tomorrow to improve my score?",
    `Why is my score ${scoreLabel} today?`,
    "Help me reduce night scrolling",
    "Start a focus sprint plan",
  ];
}

export function suggestedActions(state: UserState, coach: CoachRecommendation): string[] {
  const focusWindow = state.profile?.focusWindow.split("(")[0]?.trim() ?? "8 AM";
  const distractor = topDistractor(state.apps);
  return [
    `Start ${focusWindow} focus sprint`,
    distractor ? `Open intent gate for ${distractor.name}` : null,
    "Show tomorrow plan",
    coach.nextAction.includes("sprint") ? null : "Start focus sprint",
  ].filter((x): x is string => Boolean(x));
}

export function replyTo(
  userMessage: string,
  state: UserState,
  score: ScoreBreakdown,
  coach: CoachRecommendation
): string {
  const msg = userMessage.toLowerCase().trim();
  const distractor = topDistractor(state.apps);
  const focusWindow = state.profile?.focusWindow ?? "Morning (9–12pm)";
  const sprint = sprintType(state.goal);
  const pointsTo80 = Math.max(0, 80 - score.total);

  if (
    msg.includes("tomorrow") ||
    (msg.includes("improve") && msg.includes("score"))
  ) {
    return `Start with your strongest window: ${focusWindow}. Do 1 ${sprint} sprint + 1 learning block before opening ${distractor?.name ?? "distracting apps"}. I'll unlock entertainment after the sprint.`;
  }
  if (msg.includes("night") || msg.includes("scroll")) {
    return `Late scrolling is your biggest score leak. Set a 10 PM guard on ${distractor?.name ?? "social apps"}, and replace the first 5 minutes with a 2-minute reset or ${sprint} review.`;
  }
  if (msg.includes("score") || msg.includes("why") || msg.includes("low")) {
    return `Your score is ${score.total}/100. ${coach.diagnosis} ${
      pointsTo80 > 0
        ? `You're ${pointsTo80} points from 80+ — one ${pointsTo80 <= 10 ? 15 : 25}-minute sprint gets you there.`
        : "Keep protecting today's momentum."
    }`;
  }
  if (msg.includes("sprint") || msg.includes("focus") || msg.includes("start")) {
    return `Start a ${pointsTo80 <= 10 ? 15 : 25}-minute ${sprint} sprint now. ${coach.nextAction}`;
  }
  if (msg.includes("plan") || msg.includes("tomorrow plan")) {
    return coach.tomorrowPlan;
  }
  if (msg.includes("remind")) {
    return coach.reminder;
  }
  if (msg.includes("block") || msg.includes("instagram") || msg.includes("youtube")) {
    return `Use Intent Gate before ${distractor?.name ?? "mixed apps"} — classify each session as learning or entertainment. I'll nudge you when risk is high after 9 PM.`;
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hey — I'm your GoalOS coach. Ask me about your score, tomorrow's plan, night scrolling, or tap a suggested action below.";
  }
  if (
    state.goal?.template === "software-interview" &&
    (msg.includes("dsa") ||
      msg.includes("leetcode") ||
      msg.includes("pattern") ||
      msg.includes("two pointer") ||
      msg.includes("dynamic programming") ||
      msg.includes("dp"))
  ) {
    return `Open DSA Studio in the Goals tab for today's curated problem, hints, and a timed sprint. ${coach.nextAction} Focus one pattern per session — mastery beats volume.`;
  }
  return `${coach.nextAction}\n\n${coach.reminder}`;
}
