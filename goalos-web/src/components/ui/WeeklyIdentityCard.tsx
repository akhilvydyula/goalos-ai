import type { WeeklyReport } from "@/lib/types";
import { TAGLINE } from "@/lib/constants";
import { formatMinutes } from "@/lib/demo-data";

export function WeeklyIdentityCard({
  report,
  goalTitle,
  compact,
}: {
  report: WeeklyReport;
  goalTitle: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`goalos-card overflow-hidden bg-gradient-to-br from-[#2be7a8]/20 via-transparent to-[#68a7ff]/10 ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-[#2be7a8]/80">
        {report.weekLabel}
      </p>
      {!compact && <h3 className="mt-2 text-lg font-semibold">Weekly Identity Report</h3>}
      <div className={`${compact ? "mt-3" : "mt-5"} space-y-2 font-mono text-sm`}>
        <p className="text-zinc-500">GoalOS AI Weekly</p>
        <p>Goal: {goalTitle}</p>
        <p className="text-[#2be7a8]">Identity: {report.identity}</p>
        <p>Goal Score: {report.averageScore}/100</p>
        <p>Goal time today: {formatMinutes(report.productiveMinutes)}</p>
        <p className="mt-1 text-xs text-zinc-600">
          {report.distractionReductionPercent > 0
            ? `Score up ${report.distractionReductionPercent} pts vs prior check-in`
            : "Log actions to build your weekly trend"}
        </p>
      </div>
      {!compact && (
        <p className="mt-4 text-xs italic text-zinc-500">{TAGLINE}</p>
      )}
      <p className="mt-3 text-xs text-zinc-600">Next week: {report.nextWeekGoal}</p>
    </div>
  );
}
