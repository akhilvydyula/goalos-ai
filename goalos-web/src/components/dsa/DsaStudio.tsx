"use client";

import { useCallback, useMemo, useState } from "react";
import type { UserState } from "@/lib/types";
import {
  DSA_PATTERNS,
  DSA_PROBLEMS,
  EMPTY_DSA_PROGRESS,
  getPattern,
  leetcodeUrl,
  loadDsaProgress,
  markProblemSolved,
  patternMastery,
  pickDailyProblem,
  saveDsaProgress,
  toggleReview,
  weakPatterns,
  type DsaDifficulty,
  type DsaPatternId,
  type DsaProblem,
  type DsaProgress,
} from "@/lib/dsa";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Flame,
  Lightbulb,
  Play,
  RotateCcw,
  Search,
  Target,
  Trophy,
} from "lucide-react";

const DIFFICULTY_STYLE: Record<DsaDifficulty, string> = {
  Easy: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  Medium: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  Hard: "bg-rose-500/15 text-rose-300 border-rose-500/25",
};

function currentRoadmapWeek(state: UserState): number {
  const current = state.roadmap?.find((m) => !m.completed);
  return current?.week ?? 1;
}

export function DsaStudio({
  state,
  onStartSprint,
}: {
  state: UserState;
  onStartSprint: (title: string, minutes: number, problemId?: string) => void;
}) {
  const [progress, setProgress] = useState<DsaProgress>(() =>
    typeof window === "undefined" ? EMPTY_DSA_PROGRESS : loadDsaProgress()
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [filter, setFilter] = useState<"all" | "review" | DsaPatternId>("all");
  const [search, setSearch] = useState("");

  const week = currentRoadmapWeek(state);
  const weekMilestone = state.roadmap?.find((m) => m.week === week);

  const daily = useMemo(() => pickDailyProblem(progress, week), [progress, week]);

  const selected = selectedId
    ? DSA_PROBLEMS.find((p) => p.id === selectedId) ?? daily
    : daily;

  const persist = useCallback((next: DsaProgress) => {
    setProgress(next);
    saveDsaProgress(next);
  }, []);

  const handleSolved = useCallback(
    (id: string) => {
      if (!progress) return;
      persist(markProblemSolved(progress, id));
    },
    [progress, persist]
  );

  const filteredProblems = useMemo(() => {
    let list = DSA_PROBLEMS;
    if (filter === "review" && progress) {
      list = list.filter((p) => progress.reviewIds.includes(p.id));
    } else if (filter !== "all") {
      list = list.filter((p) => p.pattern === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          getPattern(p.pattern).name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, search, progress]);

  const solvedCount = progress.solvedIds.length;
  const totalCount = DSA_PROBLEMS.length;
  const weak = weakPatterns(progress);

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="goalos-hero-card bg-gradient-to-br from-indigo-500/10 via-transparent to-[#22c55e]/10 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              <p className="goalos-eyebrow">DSA Interview Studio</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-zinc-50">
              {weekMilestone?.title ?? "Structured interview prep"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Week {week} · {weekMilestone?.minutesPerDay ?? 60} min/day target · NeetCode-style patterns
            </p>
          </div>
          <div className="flex gap-3">
            <StatPill icon={<Trophy className="h-4 w-4" />} label="Solved" value={`${solvedCount}/${totalCount}`} />
            <StatPill icon={<Flame className="h-4 w-4 text-orange-400" />} label="Streak" value={`${progress.streakDays}d`} />
          </div>
        </div>
        <div className="mt-4 goalos-progress h-2">
          <div
            className="goalos-progress-bar bg-indigo-500"
            style={{ width: `${Math.round((solvedCount / totalCount) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {Math.round((solvedCount / totalCount) * 100)}% of curated bank · focus weak patterns below
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Problem of the day + detail */}
        <div className="space-y-4 lg:col-span-3">
          <ProblemDetailCard
            problem={selected}
            hintLevel={hintLevel}
            onHint={() => setHintLevel((h) => Math.min(h + 1, selected.hints.length))}
            onResetHints={() => setHintLevel(0)}
            solved={progress.solvedIds.includes(selected.id)}
            inReview={progress.reviewIds.includes(selected.id)}
            onSolved={() => handleSolved(selected.id)}
            onToggleReview={() => persist(toggleReview(progress, selected.id))}
            onStartSprint={() =>
              onStartSprint(`DSA: ${selected.title}`, selected.timeMinutes, selected.id)
            }
            featured={selected.id === daily.id}
          />
        </div>

        {/* Pattern mastery */}
        <div className="space-y-4 lg:col-span-2">
          <div className="goalos-card p-4">
            <p className="goalos-eyebrow">Pattern mastery</p>
            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
              {DSA_PATTERNS.map((pat) => {
                const m = patternMastery(progress, pat.id);
                return (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => {
                      setFilter(pat.id);
                      setSelectedId(null);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg border border-white/[0.04] bg-zinc-900/40 px-3 py-2 text-left transition hover:border-white/[0.1]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-xs font-mono text-zinc-400">
                      {pat.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-zinc-200">{pat.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full bg-[#22c55e] transition-all"
                            style={{ width: `${m.pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] tabular-nums text-zinc-500">
                          {m.done}/{m.total}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {weak.length > 0 && (
            <div className="goalos-card border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs font-medium text-amber-300">Coach focus</p>
              <p className="mt-1 text-xs text-zinc-500">Weakest patterns this week:</p>
              <ul className="mt-2 space-y-1">
                {weak.map((w) => (
                  <li key={w.pattern} className="text-sm text-zinc-300">
                    {getPattern(w.pattern as DsaPatternId).name} — {w.pct}%
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Problem browser */}
      <div className="goalos-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="goalos-eyebrow">Problem bank</p>
          <div className="flex flex-wrap gap-2">
            {(["all", "review"] as const).map((f) => (
              <FilterChip
                key={f}
                active={filter === f}
                onClick={() => setFilter(f)}
                label={f === "all" ? "All" : "Review queue"}
              />
            ))}
          </div>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems or patterns…"
            className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#22c55e]/40"
          />
        </div>
        <div className="mt-4 divide-y divide-white/[0.04]">
          {filteredProblems.map((p) => (
            <ProblemRow
              key={p.id}
              problem={p}
              solved={progress.solvedIds.includes(p.id)}
              active={selected.id === p.id}
              onSelect={() => {
                setSelectedId(p.id);
                setHintLevel(0);
              }}
            />
          ))}
          {filteredProblems.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500">No problems match your filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-center">
      <div className="flex items-center justify-center gap-1 text-zinc-400">{icon}</div>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-zinc-100">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-zinc-600">{label}</p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
        active ? "bg-[#22c55e]/15 text-[#22c55e]" : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}

function ProblemRow({
  problem,
  solved,
  active,
  onSelect,
}: {
  problem: DsaProblem;
  solved: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const pat = getPattern(problem.pattern);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 py-3 text-left transition ${
        active ? "bg-white/[0.02]" : "hover:bg-white/[0.02]"
      }`}
    >
      {solved ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22c55e]" />
      ) : (
        <Target className="h-4 w-4 shrink-0 text-zinc-600" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-200">{problem.title}</p>
        <p className="text-xs text-zinc-500">{pat.name} · ~{problem.timeMinutes}m</p>
      </div>
      <span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-medium ${DIFFICULTY_STYLE[problem.difficulty]}`}>
        {problem.difficulty}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600" />
    </button>
  );
}

function ProblemDetailCard({
  problem,
  hintLevel,
  onHint,
  onResetHints,
  solved,
  inReview,
  onSolved,
  onToggleReview,
  onStartSprint,
  featured,
}: {
  problem: DsaProblem;
  hintLevel: number;
  onHint: () => void;
  onResetHints: () => void;
  solved: boolean;
  inReview: boolean;
  onSolved: () => void;
  onToggleReview: () => void;
  onStartSprint: () => void;
  featured?: boolean;
}) {
  const pat = getPattern(problem.pattern);
  const lc = leetcodeUrl(problem.leetcodeSlug);

  return (
    <div className="goalos-card overflow-hidden">
      <div className="border-b border-white/[0.06] bg-zinc-900/50 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          {featured && (
            <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium uppercase text-indigo-300">
              Today&apos;s pick
            </span>
          )}
          <span className={`rounded border px-2 py-0.5 text-[10px] font-medium ${DIFFICULTY_STYLE[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <span className="text-xs text-zinc-500">{pat.name}</span>
        </div>
        <h3 className="mt-2 text-xl font-semibold text-zinc-50">{problem.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{problem.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {problem.companies.slice(0, 3).map((c) => (
            <span key={c} className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <Section title="Constraints">
          <ul className="list-inside list-disc text-sm text-zinc-400">
            {problem.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Section>

        <Section title="Hints">
          {hintLevel === 0 ? (
            <p className="text-sm text-zinc-500">Reveal hints one at a time — try the problem first.</p>
          ) : (
            <ul className="space-y-2">
              {problem.hints.slice(0, hintLevel).map((h, i) => (
                <li key={i} className="flex gap-2 text-sm text-zinc-300">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  {h}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex gap-2">
            {hintLevel < problem.hints.length && (
              <button type="button" onClick={onHint} className="goalos-btn-secondary px-3 py-1.5 text-xs">
                Reveal hint {hintLevel + 1}
              </button>
            )}
            {hintLevel > 0 && (
              <button type="button" onClick={onResetHints} className="text-xs text-zinc-500 hover:text-zinc-300">
                Reset hints
              </button>
            )}
          </div>
        </Section>

        <Section title="Optimal approach">
          <ol className="list-decimal space-y-1 pl-4 text-sm text-zinc-300">
            {problem.approach.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="mt-3 font-mono text-xs text-zinc-500">
            Time {problem.complexity.time} · Space {problem.complexity.space}
          </p>
        </Section>

        <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
          <button type="button" onClick={onStartSprint} className="goalos-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm">
            <Play className="h-4 w-4" />
            Start {problem.timeMinutes}m sprint
          </button>
          {!solved && (
            <button type="button" onClick={onSolved} className="goalos-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Mark solved
            </button>
          )}
          {solved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-[#22c55e]">
              <CheckCircle2 className="h-4 w-4" /> Solved
            </span>
          )}
          <button
            type="button"
            onClick={onToggleReview}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              inReview ? "border-amber-500/30 text-amber-300" : "border-white/[0.08] text-zinc-400"
            }`}
          >
            <RotateCcw className="h-4 w-4" />
            {inReview ? "In review" : "Add to review"}
          </button>
          {lc && (
            <a
              href={lc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200"
            >
              <ExternalLink className="h-4 w-4" />
              LeetCode
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/** Compact card for Today dashboard */
export function DsaDashboardTeaser({
  state,
  onOpenGoal,
}: {
  state: UserState;
  onOpenGoal: () => void;
}) {
  const [progress] = useState<DsaProgress>(() =>
    typeof window === "undefined" ? EMPTY_DSA_PROGRESS : loadDsaProgress()
  );

  const week = currentRoadmapWeek(state);
  const daily = pickDailyProblem(progress, week);

  return (
    <div className="goalos-card border-l-2 border-l-indigo-500 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="goalos-eyebrow">DSA studio</p>
          <p className="mt-1 font-medium text-zinc-100">Today: {daily.title}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {progress.solvedIds.length}/{DSA_PROBLEMS.length} solved · {progress.streakDays}d streak
          </p>
        </div>
        <button type="button" onClick={onOpenGoal} className="goalos-btn-secondary shrink-0 px-3 py-2 text-xs">
          Open studio
        </button>
      </div>
    </div>
  );
}
