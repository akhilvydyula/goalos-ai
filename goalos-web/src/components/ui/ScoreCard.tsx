import type { ScoreBreakdown } from "@/lib/types";
import { scoreColor } from "@/lib/scoring";

export function ScoreCard({ score }: { score: ScoreBreakdown }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score.total / 100) * circumference;

  return (
    <div className="goalos-card goalos-card-glow p-6">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        Goal Alignment Score
      </p>
      <div className="mt-4 flex items-center gap-6">
        <div className="relative h-32 w-32 shrink-0">
          <svg className="-rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2be7a8" />
                <stop offset="100%" stopColor="#68a7ff" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold tabular-nums ${scoreColor(score.total)}`}>
              {score.total}
            </span>
            <span className="text-xs text-zinc-500">/ 100</span>
          </div>
        </div>
        <div className="flex-1 space-y-2 text-sm">
          <ScoreRow label="Goal time" value={score.goalSupportingTime} max={30} />
          <ScoreRow label="Roadmap" value={score.roadmapCompletion} max={20} />
          <ScoreRow label="Deep work" value={score.deepWork} max={15} />
          {score.distractionPenalty < 0 && (
            <p className="text-rose-400/90">Distraction {score.distractionPenalty} pts</p>
          )}
        </div>
      </div>
      <p className="mt-4 text-sm text-zinc-500">
        Based on today&apos;s behavior — are you moving closer to your goal?
      </p>
    </div>
  );
}

function ScoreRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-zinc-500">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#2be7a8] to-[#68a7ff]"
            style={{ width: `${(value / max) * 100}%` }}
          />
        </div>
        <span className="w-8 text-right tabular-nums text-zinc-300">{value}</span>
      </div>
    </div>
  );
}
