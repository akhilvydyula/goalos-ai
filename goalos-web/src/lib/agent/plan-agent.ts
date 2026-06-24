import type { DnaAnswers, RoadmapMilestone, UserGoal } from "../types";

const PLAN_TEMPLATES: Record<string, { weeks: { title: string; minutesPerDay: number }[] }> = {
  "data-engineering-job": {
    weeks: [
      { title: "SQL fundamentals + window functions", minutesPerDay: 60 },
      { title: "PySpark basics + data pipelines", minutesPerDay: 75 },
      { title: "Portfolio project #1 — ETL pipeline", minutesPerDay: 90 },
      { title: "System design for data + mock interviews", minutesPerDay: 90 },
    ],
  },
  "software-interview": {
    weeks: [
      { title: "Arrays, hashing, two pointers & sliding window", minutesPerDay: 60 },
      { title: "Trees, graphs, BFS/DFS & heaps", minutesPerDay: 75 },
      { title: "DP, backtracking & intervals", minutesPerDay: 90 },
      { title: "System design mocks + mixed review", minutesPerDay: 90 },
    ],
  },
  "founder-mode": {
    weeks: [
      { title: "Validate problem + talk to 5 users", minutesPerDay: 45 },
      { title: "MVP scope + ship v0.1", minutesPerDay: 90 },
      { title: "Distribution experiments", minutesPerDay: 60 },
      { title: "Metrics review + iterate", minutesPerDay: 75 },
    ],
  },
  "learn-ai-de": {
    weeks: [
      { title: "Python + pandas refresh", minutesPerDay: 45 },
      { title: "ML fundamentals + sklearn", minutesPerDay: 60 },
      { title: "LLM apps + RAG project", minutesPerDay: 75 },
      { title: "Deploy + document portfolio", minutesPerDay: 90 },
    ],
  },
  "reduce-social-media": {
    weeks: [
      { title: "Audit triggers + set night guard", minutesPerDay: 20 },
      { title: "Replace scroll with 15m learning", minutesPerDay: 30 },
      { title: "Intent Gate every mixed app open", minutesPerDay: 25 },
      { title: "Sustain 80+ alignment score", minutesPerDay: 30 },
    ],
  },
};

export function generateRoadmap(goal: UserGoal, dna?: DnaAnswers): RoadmapMilestone[] {
  const template = PLAN_TEMPLATES[goal.template] ?? PLAN_TEMPLATES["learn-ai-de"];
  const totalWeeks = Math.min(goal.timelineWeeks, template.weeks.length);
  const energyBoost = (dna?.energyLevel ?? 3) >= 4 ? 15 : 0;

  return template.weeks.slice(0, totalWeeks).map((week, i) => ({
    week: i + 1,
    title: week.title,
    minutesPerDay: Math.min(120, week.minutesPerDay + (i === 0 ? 0 : energyBoost)),
    completed: false,
  }));
}

export function roadmapSummary(milestones: RoadmapMilestone[]): string {
  if (!milestones.length) return "No roadmap yet.";
  const current = milestones.find((m) => !m.completed) ?? milestones[0];
  return `Week ${current.week}: ${current.title} (${current.minutesPerDay} min/day)`;
}
