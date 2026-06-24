import type { UserState, AppClassification } from "@/lib/types";
import { formatMinutes } from "@/lib/demo-data";
import { IDENTITY_DESCRIPTIONS } from "@/lib/constants";

const CLASS_OPTIONS: { value: AppClassification; label: string; color: string }[] = [
  { value: "goal-supporting", label: "Goal", color: "bg-emerald-500/20 text-emerald-300" },
  { value: "mixed", label: "Mixed", color: "bg-amber-500/20 text-amber-300" },
  { value: "neutral", label: "Neutral", color: "bg-zinc-500/20 text-zinc-300" },
  { value: "distracting", label: "Distract", color: "bg-rose-500/20 text-rose-300" },
];

export function GoalTab({
  state,
  onClassify,
  onIntentGate,
}: {
  state: UserState;
  onClassify: (appId: string, c: AppClassification) => void;
  onIntentGate: (appId: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="goalos-card p-5">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Active Goal</p>
        <h2 className="mt-1 text-xl font-semibold">{state.goal?.title}</h2>
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

      {state.profile && (
        <div className="goalos-card p-4">
          <p className="text-sm font-medium text-[#2be7a8]">{state.profile.identity}</p>
          <p className="mt-1 text-sm text-zinc-500">
            {IDENTITY_DESCRIPTIONS[state.profile.identity]}
          </p>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-400">App Classification</h3>
        <div className="space-y-3">
          {state.apps.map((app) => (
            <div key={app.id} className="goalos-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{app.name}</p>
                  <p className="text-xs text-zinc-500">{formatMinutes(app.minutesToday)} today</p>
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
