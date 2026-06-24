import type { UserState, AppClassification } from "@/lib/types";
import { formatMinutes } from "@/lib/demo-data";
import { IDENTITY_DESCRIPTIONS } from "@/lib/constants";
import { AppIcon, SectionLabel } from "@/components/ui/AppIcon";
import { roadmapSummary } from "@/lib/agent";
import { DsaStudio } from "@/components/dsa/DsaStudio";
import { Target, Map, Plus } from "lucide-react";

const CLASS_OPTIONS: { value: AppClassification; label: string; color: string }[] = [
  { value: "goal-supporting", label: "Goal", color: "bg-emerald-500/20 text-emerald-300" },
  { value: "mixed", label: "Mixed", color: "bg-amber-500/20 text-amber-300" },
  { value: "neutral", label: "Neutral", color: "bg-zinc-500/20 text-zinc-300" },
  { value: "distracting", label: "Distract", color: "bg-rose-500/20 text-rose-300" },
];

const LOG_INCREMENTS = [15, 30, 45] as const;

export function GoalTab({
  state,
  onClassify,
  onLogUsage,
  onIntentGate,
  onStartSprint,
}: {
  state: UserState;
  onClassify: (appId: string, c: AppClassification) => void;
  onLogUsage: (appId: string, minutes: number) => void;
  onIntentGate: (appId: string) => void;
  onStartSprint?: (title: string, minutes: number, problemId?: string) => void;
}) {
  const isDsaGoal = state.goal?.template === "software-interview";

  return (
    <div className="space-y-5">
      {isDsaGoal && onStartSprint && (
        <DsaStudio
          state={state}
          onStartSprint={(title, minutes, problemId) => {
            onStartSprint(title, minutes, problemId);
          }}
        />
      )}
      {!state.demoMode ? (
        <div className="goalos-card border-[#2be7a8]/20 bg-[#2be7a8]/5 p-4">
          <p className="text-sm font-medium text-[#2be7a8]">Log your screen time</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            The web demo cannot read your phone. Tap +15 / +30 / +45 under each app to log time —
            your Goal Alignment Score updates immediately.
          </p>
        </div>
      ) : (
        <div className="goalos-card border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm font-medium text-amber-300">Sample data mode</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Pre-filled usage is for preview. You can still log time and run sprints — changes update
            your score live.
          </p>
        </div>
      )}

      <div className="goalos-card goalos-card-glow p-5">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[#68a7ff]" />
          <SectionLabel>Active goal</SectionLabel>
        </div>
        <h2 className="mt-2 text-xl font-semibold text-zinc-50">{state.goal?.title}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-zinc-500">Timeline</p>
            <p className="font-medium">{state.goal?.timelineWeeks} weeks</p>
          </div>
          <div>
            <p className="text-zinc-500">Daily commit</p>
            <p className="font-medium">{state.goal?.dailyCommitmentMinutes} min</p>
          </div>
          <div className="col-span-2">
            <p className="text-zinc-500">Focus window</p>
            <p className="font-medium">{state.goal?.focusWindow}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Roadmap progress</span>
            <span className="text-[#2be7a8]">{state.roadmapProgress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2be7a8] to-[#68a7ff]"
              style={{ width: `${state.roadmapProgress}%` }}
            />
          </div>
        </div>
      </div>

      {state.roadmap && state.roadmap.length > 0 && (
        <div className="goalos-card p-5">
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-[#2be7a8]" />
            <SectionLabel>Goal roadmap</SectionLabel>
          </div>
          <p className="mt-2 text-sm text-zinc-400">{roadmapSummary(state.roadmap)}</p>
          <div className="mt-4 space-y-2">
            {state.roadmap.map((m) => (
              <div
                key={m.week}
                className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${
                  m.completed
                    ? "border-[#2be7a8]/20 bg-[#2be7a8]/5"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div>
                  <p className="font-medium text-zinc-200">
                    Week {m.week}: {m.title}
                  </p>
                  <p className="text-xs text-zinc-500">{m.minutesPerDay} min/day</p>
                </div>
                {m.completed && (
                  <span className="text-[10px] font-medium uppercase text-[#2be7a8]">Done</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {state.profile && (
        <div className="goalos-card p-4">
          <p className="text-sm font-medium text-[#2be7a8]">{state.profile.identity}</p>
          <p className="mt-1 text-sm text-zinc-500">
            {IDENTITY_DESCRIPTIONS[state.profile.identity]}
          </p>
        </div>
      )}

      <div>
        <SectionLabel>Apps & classification</SectionLabel>
        <div className="mt-3 space-y-3">
          {state.apps.map((app) => (
            <div key={app.id} className="goalos-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <AppIcon name={app.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-100">{app.name}</p>
                    <p className="text-xs text-zinc-500">{formatMinutes(app.minutesToday)} today</p>
                  </div>
                </div>
                {(app.classification === "mixed" || app.classification === "distracting") && (
                  <button
                    type="button"
                    onClick={() => onIntentGate(app.id)}
                    className="text-xs font-medium text-[#2be7a8]"
                  >
                    Intent Gate
                  </button>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {LOG_INCREMENTS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onLogUsage(app.id, mins)}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-[#2be7a8]/30 hover:text-[#2be7a8]"
                  >
                    <Plus className="h-3 w-3" />{mins}m
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {CLASS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onClassify(app.id, opt.value)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      app.classification === opt.value
                        ? opt.color + " ring-1 ring-white/20"
                        : "bg-white/5 text-zinc-500"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
