import type { UserState, ScoreBreakdown, CoachRecommendation } from "@/lib/types";
import { AppIcon } from "@/components/ui/AppIcon";
import { Sparkline, BarChart, DayLabels } from "@/components/ui/MiniCharts";
import { formatMinutes, totalScreenMinutes, chartSeries, formatDelta } from "@/lib/demo-data";
import { focusMinutesToday, focusMinutesWeekBars, sprintsTodayCount } from "@/lib/app-metrics";
import {
  ScoreHeroCard,
  NextBestActionCard,
  ProductiveTimeCard,
  RiskWindowCard,
  SmartReminderCard,
  FocusSprintCard,
  PrivacyPromiseCard,
  TomorrowPlanCard,
} from "@/components/dashboard/ProductCards";
import { DsaDashboardTeaser } from "@/components/dsa/DsaStudio";
import {
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";

const APP_CATEGORY: Record<string, string> = {
  Udemy: "Learning",
  ChatGPT: "Productivity",
  YouTube: "Entertainment",
  Instagram: "Social",
  LinkedIn: "Professional",
  LeetCode: "Learning",
  Notion: "Productivity",
  Chrome: "Browser",
  WhatsApp: "Messaging",
  TikTok: "Social",
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

export function MobileDashboard({
  state,
  score,
  coach,
  onStartSprint,
  onViewAllApps,
  onIntentGate,
  onLogUsage,
}: {
  state: UserState;
  score: ScoreBreakdown;
  coach: CoachRecommendation;
  onStartSprint: () => void;
  onViewAllApps?: () => void;
  onIntentGate?: (appId: string) => void;
  onLogUsage?: (appId: string, minutes: number) => void;
}) {
  const total = totalScreenMinutes(state.apps);
  const weekBars = chartSeries(state.weeklyHistory);
  const topApps = [...state.apps].sort((a, b) => b.minutesToday - a.minutesToday).slice(0, 5);
  const usedApps = topApps.filter((a) => a.minutesToday > 0);
  const maxApp = usedApps[0]?.minutesToday ?? 1;
  const screenDeltaLabel =
    total === 0 ? "Starting today" : `${usedApps.length} app${usedApps.length === 1 ? "" : "s"} tracked`;

  return (
    <div className="space-y-4 pb-2">
      <ScoreHeroCard
        score={score}
        coach={coach}
        goalTitle={state.goal?.title ?? "Your Goal"}
      />

      <NextBestActionCard
        coach={coach}
        goalTitle={state.goal?.title ?? "Your Goal"}
        onStartSprint={onStartSprint}
        compact
      />

      <div className="grid grid-cols-2 gap-3">
        <ProductiveTimeCard state={state} />
        <FocusSprintCard state={state} onStartSprint={onStartSprint} />
      </div>

      <RiskWindowCard state={state} />
      <SmartReminderCard coach={coach} />

      {state.goal?.template === "software-interview" && onViewAllApps && (
        <DsaDashboardTeaser state={state} onOpenGoal={onViewAllApps} />
      )}

      {/* Screen Time */}
      <div className="goalos-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-zinc-500">Screen Time</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-zinc-50">
              {formatMinutes(total)}
            </p>
            <p className="text-xs text-zinc-500">Today</p>
          </div>
          <span className="rounded-md bg-[#22c55e]/15 px-2 py-0.5 text-[11px] font-medium text-[#22c55e]">
            {screenDeltaLabel}
          </span>
        </div>
        <div className="mt-4">
          <BarChart data={weekBars} labels={WEEK_DAYS} highlightIndex={todayIndex} />
          <DayLabels labels={WEEK_DAYS} activeIndex={todayIndex} />
          <p className="mt-1 text-[10px] text-zinc-600">Score check-ins (not screen minutes)</p>
        </div>
      </div>

      <PrivacyPromiseCard compact />

      {/* App Usage */}
      <div className="goalos-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-100">App Usage</h3>
          <button
            type="button"
            onClick={onViewAllApps}
            className="text-xs font-medium text-[#68a7ff]"
          >
            View all
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {usedApps.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">
              No usage logged yet. Go to <strong className="text-zinc-400">Goals</strong> and tap
              +15m under an app, or complete a focus sprint.
            </p>
          ) : (
            usedApps.map((app) => {
            const pct = Math.round((app.minutesToday / total) * 100) || 0;
            const barPct = Math.round((app.minutesToday / maxApp) * 100);
            return (
              <div key={app.id} className="flex items-center gap-3">
                <AppIcon name={app.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{app.name}</p>
                      <p className="text-[11px] text-zinc-500">
                        {APP_CATEGORY[app.name] ?? "App"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm tabular-nums text-zinc-300">
                        {formatMinutes(app.minutesToday)}
                      </p>
                      <p className="text-[11px] text-zinc-500">{pct}%</p>
                    </div>
                  </div>
                  <div className="goalos-progress mt-2">
                    <div className="goalos-progress-bar" style={{ width: `${barPct}%` }} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      (app.classification === "mixed" || app.classification === "distracting") &&
                      onIntentGate
                    ) {
                      onIntentGate(app.id);
                    } else if (onLogUsage) {
                      onLogUsage(app.id, 15);
                    } else {
                      onViewAllApps?.();
                    }
                  }}
                  className="text-zinc-500 hover:text-zinc-300"
                  aria-label={`Actions for ${app.name}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
}

export function WebDashboard({
  state,
  score,
  coach,
  onStartSprint,
  onOpenCoach,
  onOpenGoal,
}: {
  state: UserState;
  score: ScoreBreakdown;
  coach: CoachRecommendation;
  onStartSprint: () => void;
  onOpenCoach: () => void;
  onOpenGoal?: () => void;
}) {
  const roadmapPct = state.roadmapProgress;
  const focusMinsToday = focusMinutesToday(state.focusSprints);
  const focusH = Math.floor(focusMinsToday / 60);
  const focusM = focusMinsToday % 60;
  const focusTime = focusMinsToday === 0 ? "0m" : focusH > 0 ? `${focusH}h ${focusM}m` : `${focusM}m`;
  const weekTrend = chartSeries(state.weeklyHistory);
  const trendDelta =
    state.weeklyHistory.length >= 2
      ? state.weeklyHistory[state.weeklyHistory.length - 1] -
        state.weeklyHistory[state.weeklyHistory.length - 2]
      : null;
  const sprintsToday = sprintsTodayCount(state.focusSprints);
  const habitScore = score.total;
  const focusWeekBars = focusMinutesWeekBars(state.focusSprints);

  const goals = [
    {
      title: state.goal?.title ?? "Your Goal",
      pct: roadmapPct,
      color: "bg-[#22c55e]",
    },
    ...(state.roadmap?.slice(0, 2).map((m) => ({
      title: m.title,
      pct: m.completed ? 100 : 0,
      color: "bg-[#3b82f6]",
    })) ?? []),
  ].slice(0, 3);

  return (
    <div className="space-y-5">
      <ScoreHeroCard
        score={score}
        coach={coach}
        goalTitle={state.goal?.title ?? "Your Goal"}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NextBestActionCard
            coach={coach}
            goalTitle={state.goal?.title ?? "Your Goal"}
            onStartSprint={onStartSprint}
            onOpenCoach={onOpenCoach}
          />
        </div>
        <div className="space-y-4">
          <SmartReminderCard coach={coach} />
          <TomorrowPlanCard coach={coach} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProductiveTimeCard state={state} />
        <FocusSprintCard state={state} onStartSprint={onStartSprint} />
        <RiskWindowCard state={state} />
        <PrivacyPromiseCard compact />
      </div>

      {state.goal?.template === "software-interview" && onOpenGoal && (
        <DsaDashboardTeaser state={state} onOpenGoal={onOpenGoal} />
      )}

      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile
            label="Goals Progress"
            value={`${roadmapPct}%`}
            delta={roadmapPct === 0 ? "Complete sprints to advance" : `${state.roadmap?.filter((m) => m.completed).length ?? 0} milestones done`}
            positive={roadmapPct > 0}
            data={weekTrend.length >= 2 ? weekTrend : [roadmapPct, roadmapPct]}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        <MetricTile
            label="Focus Sprints"
            value={String(sprintsToday)}
            delta={sprintsToday === 0 ? "None yet today" : `${sprintsToday} completed today`}
            positive={sprintsToday > 0}
            data={focusWeekBars}
            icon={<CheckCircle2 className="h-4 w-4" />}
            color="#3b82f6"
          />
        <MetricTile
            label="Focus Time"
            value={focusTime}
            delta={focusMinsToday === 0 ? "Start a sprint" : "Logged today"}
            positive={focusMinsToday > 0}
            data={focusWeekBars}
            icon={<Clock className="h-4 w-4" />}
            color="#3b82f6"
          />
        <MetricTile
            label="Alignment Score"
            value={`${habitScore}`}
            delta={formatDelta(trendDelta, "vs last check-in")}
            positive={trendDelta === null || trendDelta >= 0}
            data={weekTrend}
            icon={<Flame className="h-4 w-4" />}
          />
      </div>

      {/* Bottom row */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="goalos-card p-6">
          <h3 className="font-semibold text-zinc-100">Goals Overview</h3>
          <p className="mt-1 text-xs text-zinc-500">Active goal and roadmap milestones</p>
          <div className="mt-5 space-y-4">
            {goals.map((g) => (
              <div key={g.title}>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">{g.title}</span>
                  <span className="font-medium text-zinc-200">{g.pct}%</span>
                </div>
                <div className="goalos-progress mt-2">
                  <div className={`goalos-progress-bar ${g.color}`} style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="goalos-card p-6">
          <h3 className="font-semibold text-zinc-100">Weekly Focus</h3>
          <p className="mt-1 text-xs text-zinc-500">Focus minutes by day (today only has live data)</p>
          <div className="mt-3 flex justify-between text-[11px] text-zinc-500">
            {WEEK_DAYS.map((d, i) => (
              <span
                key={d}
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  i === todayIndex ? "bg-[#22c55e]/15 font-medium text-[#22c55e]" : ""
                }`}
              >
                {d[0]}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-500">Focus time today</p>
          <p className="text-2xl font-bold text-zinc-50">{focusTime}</p>
          <div className="mt-3">
            <BarChart
              data={focusWeekBars}
              labels={WEEK_DAYS}
              highlightIndex={todayIndex}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  delta,
  positive,
  data,
  icon,
  color = "#22c55e",
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
  data: number[];
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="goalos-card p-4">
      <div className="flex items-center justify-between text-zinc-500">{icon}</div>
      <p className="mt-2 text-[11px] text-zinc-500">{label}</p>
      <p className="mt-0.5 text-2xl font-bold tabular-nums text-zinc-50">{value}</p>
      <p className={`mt-0.5 text-[11px] ${positive ? "text-[#22c55e]" : "text-zinc-500"}`}>
        {delta}
      </p>
      <div className="mt-3">
        <Sparkline data={data} color={color} width={120} />
      </div>
    </div>
  );
}

// Export greeting helper for top bar
export function dashboardGreeting(name: string) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${greeting}, ${name}`;
}
