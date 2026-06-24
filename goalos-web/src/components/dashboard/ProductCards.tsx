"use client";

import type { CoachRecommendation, ScoreBreakdown, UserState } from "@/lib/types";
import { AlignmentGauge } from "@/components/ui/MiniCharts";
import { ScoreLabel } from "@/components/ui/AppIcon";
import { PRIVACY_PROMISE, TAGLINE } from "@/lib/constants";
import {
  deriveBestFocusWindow,
  deriveRiskWindow,
  formatProductiveSummary,
  scoreHelpedAndHurt,
} from "@/lib/product-metrics";
import { focusMinutesToday, sprintsTodayCount } from "@/lib/app-metrics";
import { scoreGradient } from "@/lib/scoring";
import {
  Shield,
  Sparkles,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Flame,
  Lock,
} from "lucide-react";

export function ScoreHeroCard({
  score,
  coach,
  goalTitle,
}: {
  score: ScoreBreakdown;
  coach: CoachRecommendation;
  goalTitle: string;
}) {
  const { helped, hurt } = scoreHelpedAndHurt(score);
  const gradient = scoreGradient(score.total);

  return (
    <div className={`goalos-hero-card bg-gradient-to-br ${gradient} p-6 lg:p-8`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex shrink-0 flex-col items-center lg:items-start">
          <p className="goalos-eyebrow">Goal Alignment Score</p>
          <div className="mt-3">
            <AlignmentGauge score={score.total} size="lg" />
          </div>
          <div className="mt-3">
            <ScoreLabel score={score.total} />
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <p className="text-sm leading-relaxed text-zinc-300">{coach.diagnosis}</p>
          <p className="text-xs text-zinc-500">Goal: {goalTitle}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/[0.06] bg-black/20 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-[#22c55e]">
                <TrendingUp className="h-3 w-3" />
                What helped
              </p>
              <ul className="mt-2 space-y-1">
                {helped.length === 0 ? (
                  <li className="text-xs text-zinc-500">Log goal time to build your score</li>
                ) : (
                  helped.slice(0, 3).map((h) => (
                    <li key={h.label} className="flex justify-between text-xs">
                      <span className="text-zinc-400">{h.label}</span>
                      <span className="font-medium text-[#22c55e]">+{h.points}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-black/20 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-rose-400">
                <TrendingDown className="h-3 w-3" />
                What hurt
              </p>
              <ul className="mt-2 space-y-1">
                {hurt.length === 0 ? (
                  <li className="text-xs text-zinc-500">No penalties today — nice work</li>
                ) : (
                  hurt.slice(0, 3).map((h) => (
                    <li key={h.label} className="flex justify-between text-xs">
                      <span className="text-zinc-400">{h.label}</span>
                      <span className="font-medium text-rose-400">{h.points}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NextBestActionCard({
  coach,
  goalTitle,
  onStartSprint,
  onOpenCoach,
  compact,
}: {
  coach: CoachRecommendation;
  goalTitle: string;
  onStartSprint: () => void;
  onOpenCoach?: () => void;
  compact?: boolean;
}) {
  return (
    <div className="goalos-card border-l-2 border-l-[#3b82f6] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3b82f6]/15">
          <Sparkles className="h-5 w-5 text-[#3b82f6]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="goalos-eyebrow">AI next best action</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-100">
            {coach.nextAction}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{goalTitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={onStartSprint} className="goalos-btn-primary px-4 py-2 text-sm">
              Start focus sprint
            </button>
            {onOpenCoach && !compact && (
              <button type="button" onClick={onOpenCoach} className="goalos-btn-secondary px-4 py-2 text-sm">
                Ask coach
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductiveTimeCard({ state }: { state: UserState }) {
  const { productive, distracted, goalTimeLabel, distractTimeLabel } = formatProductiveSummary(state.apps);
  const total = productive + distracted || 1;
  const productivePct = Math.round((productive / total) * 100);

  return (
    <div className="goalos-card p-5">
      <p className="goalos-eyebrow">Goal time vs distraction</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold tabular-nums text-[#22c55e]">{goalTimeLabel}</p>
          <p className="text-xs text-zinc-500">Goal-supporting</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-amber-400">{distractTimeLabel}</p>
          <p className="text-xs text-zinc-500">Mixed + distracting</p>
        </div>
      </div>
      <div className="goalos-progress mt-4 h-2">
        <div
          className="h-full rounded-full bg-[#22c55e] transition-all"
          style={{ width: `${productivePct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-zinc-500">{productivePct}% of tracked time aligned today</p>
    </div>
  );
}

export function RiskWindowCard({ state }: { state: UserState }) {
  const risk = deriveRiskWindow(state);
  const best = deriveBestFocusWindow(state);

  return (
    <div className="goalos-card p-5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <p className="text-sm font-medium text-zinc-200">Risk window</p>
      </div>
      <p className="mt-2 text-lg font-semibold text-amber-400">{risk}</p>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        Your strongest focus window is <span className="text-zinc-300">{best}</span>.
        Use Intent Gate before mixed apps during risk hours.
      </p>
    </div>
  );
}

export function SmartReminderCard({ coach }: { coach: CoachRecommendation }) {
  return (
    <div className="goalos-card bg-zinc-900/60 p-4">
      <p className="goalos-eyebrow">Smart reminder</p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{coach.reminder}</p>
      <p className="mt-2 text-xs text-zinc-600">Contextual only — no spam</p>
    </div>
  );
}

export function FocusSprintCard({
  state,
  onStartSprint,
}: {
  state: UserState;
  onStartSprint: () => void;
}) {
  const sprints = sprintsTodayCount(state.focusSprints);
  const focusMins = focusMinutesToday(state.focusSprints);

  return (
    <div className="goalos-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-[#22c55e]" />
          <p className="text-sm font-medium text-zinc-200">Focus sprint</p>
        </div>
        <span className="text-xs text-zinc-500">{sprints} today</span>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-zinc-50">
        {focusMins > 0 ? `${focusMins}m` : "—"}
      </p>
      <p className="text-xs text-zinc-500">Deep work logged today</p>
      <button type="button" onClick={onStartSprint} className="goalos-btn-secondary mt-4 w-full py-2 text-sm">
        {sprints > 0 ? "Start another sprint" : "Start 25-min sprint"}
      </button>
    </div>
  );
}

export function PrivacyPromiseCard({ compact }: { compact?: boolean }) {
  return (
    <div className={`goalos-card border-[#22c55e]/20 bg-[#22c55e]/5 ${compact ? "p-4" : "p-5"}`}>
      <div className="flex gap-3">
        <Shield className="h-5 w-5 shrink-0 text-[#22c55e]" />
        <div>
          <p className="text-sm font-medium text-zinc-200">Privacy promise</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">{PRIVACY_PROMISE}</p>
          {!compact && (
            <p className="mt-2 flex items-center gap-1 text-[10px] text-zinc-600">
              <Lock className="h-3 w-3" />
              Open source · local-first analytics
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function TomorrowPlanCard({ coach }: { coach: CoachRecommendation }) {
  return (
    <div className="goalos-card p-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-zinc-500" />
        <p className="goalos-eyebrow">Tomorrow plan</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{coach.tomorrowPlan}</p>
    </div>
  );
}

export function ProductTagline() {
  return (
    <p className="text-center text-xs italic text-zinc-600">
      {TAGLINE} · Know where your time goes. Know who you are becoming.
    </p>
  );
}
