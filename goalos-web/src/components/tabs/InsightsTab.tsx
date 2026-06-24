import type { UserState, ScoreBreakdown, WeeklyReport } from "@/lib/types";
import { formatMinutes } from "@/lib/demo-data";
import { COMMUNITY_CHALLENGES } from "@/lib/constants";
import { WeeklyIdentityCard } from "@/components/ui/WeeklyIdentityCard";

export function InsightsTab({
  state,
  score,
  weeklyReport,
  layout = "mobile",
}: {
  state: UserState;
  score: ScoreBreakdown;
  weeklyReport: WeeklyReport;
  layout?: "web" | "mobile";
}) {
  const topApps = [...state.apps].sort((a, b) => b.minutesToday - a.minutesToday).slice(0, 5);

  return (
    <div className={layout === "web" ? "grid gap-5 lg:grid-cols-2" : "space-y-5"}>
      <WeeklyIdentityCard report={weeklyReport} goalTitle={state.goal?.title ?? "Your Goal"} />

      {weeklyReport.coachLetter && (
        <div className="goalos-card border-[#68a7ff]/20 bg-[#68a7ff]/5 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#68a7ff]/80">
            Insights agent
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{weeklyReport.coachLetter}</p>
        </div>
      )}

      <div className="goalos-card p-4">
        <h3 className="text-sm font-medium text-zinc-400">Score Breakdown</h3>
        <ul className="mt-3 space-y-2 text-sm">
          <BreakdownRow label="Goal-supporting time" value={score.goalSupportingTime} />
          <BreakdownRow label="Roadmap completion" value={score.roadmapCompletion} />
          <BreakdownRow label="Deep work" value={score.deepWork} />
          <BreakdownRow label="Intent match" value={score.intentMatch} />
          <BreakdownRow label="Wellness balance" value={score.wellnessBalance} />
          {score.distractionPenalty < 0 && (
            <BreakdownRow label="Distraction penalty" value={score.distractionPenalty} negative />
          )}
          {score.lateNightPenalty < 0 && (
            <BreakdownRow label="Late-night penalty" value={score.lateNightPenalty} negative />
          )}
        </ul>
      </div>

      <div className="goalos-card p-4">
        <h3 className="text-sm font-medium text-zinc-400">Top Apps Today</h3>
        <div className="mt-3 space-y-3">
          {topApps.map((app) => (
            <div key={app.id} className="flex items-center justify-between text-sm">
              <span>{app.name}</span>
              <span className="text-zinc-500">{formatMinutes(app.minutesToday)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="goalos-card p-3">
          <p className="text-zinc-500">Best focus</p>
          <p className="font-medium">{weeklyReport.bestFocusWindow}</p>
        </div>
        <div className="goalos-card p-3">
          <p className="text-zinc-500">Risk window</p>
          <p className="font-medium text-amber-400">{weeklyReport.riskWindow}</p>
        </div>
      </div>

      <div className="goalos-card p-4">
        <h3 className="text-sm font-medium text-zinc-300">Community challenges</h3>
        <p className="mt-1 text-xs text-zinc-500">Join a sprint to build consistency</p>
        <ul className="mt-3 space-y-2">
          {COMMUNITY_CHALLENGES.map((c) => (
            <li
              key={c}
              className="rounded-lg border border-white/[0.06] px-3 py-2 text-sm text-zinc-400"
            >
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  negative,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <li className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className={negative ? "text-rose-400" : "text-zinc-200"}>
        {negative ? value : `+${value}`}
      </span>
    </li>
  );
}
