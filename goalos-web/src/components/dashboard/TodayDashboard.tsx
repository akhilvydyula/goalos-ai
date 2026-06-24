import type { UserState, ScoreBreakdown, CoachRecommendation } from "@/lib/types";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { HeroCard, MetricCard } from "@/components/ui/GoalOSComponents";
import { formatMinutes } from "@/lib/demo-data";
import { Zap, AlertTriangle, Shield } from "lucide-react";

export function TodayDashboard({
  state,
  score,
  coach,
  onStartSprint,
  onIntentGate,
}: {
  state: UserState;
  score: ScoreBreakdown;
  coach: CoachRecommendation;
  onStartSprint: () => void;
  onIntentGate: (appId: string) => void;
}) {
  const productive = state.apps
    .filter((a) => a.classification === "goal-supporting")
    .reduce((s, a) => s + a.minutesToday, 0);
  const distracted = state.apps
    .filter((a) => a.classification === "distracting")
    .reduce((s, a) => s + a.minutesToday, 0);

  const riskApp = [...state.apps]
    .filter((a) => a.classification === "distracting" || a.classification === "mixed")
    .sort((a, b) => b.minutesToday - a.minutesToday)[0];

  return (
    <div className="space-y-4">
      <ScoreCard score={score} />

      <HeroCard
        title="AI Next Best Action"
        body={coach.nextAction}
        actionLabel="Start Focus Sprint"
        onAction={onStartSprint}
        icon={<Zap className="h-5 w-5" />}
      />

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Goal time" value={formatMinutes(productive)} accent="positive" />
        <MetricCard label="Distracted" value={formatMinutes(distracted)} accent="warning" />
      </div>

      {riskApp && (
        <div className="goalos-card border-amber-500/20 p-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Risk Window</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {riskApp.name} used {formatMinutes(riskApp.minutesToday)} today — mostly after 8pm.
          </p>
          <button
            type="button"
            onClick={() => onIntentGate(riskApp.id)}
            className="mt-3 text-sm font-medium text-[#68a7ff] hover:text-[#8bb8ff]"
          >
            Open Intent Gate →
          </button>
        </div>
      )}

      <div className="goalos-card p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#2be7a8]" />
          <span className="text-sm font-medium text-zinc-300">
            Identity: {state.profile?.identity}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">{coach.reminder}</p>
      </div>

      <p className="pb-2 text-center text-[10px] text-zinc-600">
        Demo data · Android app uses real UsageStatsManager
      </p>
    </div>
  );
}
