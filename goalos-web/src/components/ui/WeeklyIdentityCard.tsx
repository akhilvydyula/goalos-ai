"use client";

import type { WeeklyReport } from "@/lib/types";
import { TAGLINE } from "@/lib/constants";
import { formatMinutes } from "@/lib/demo-data";
import { Share2, Copy, Check } from "lucide-react";
import { useCallback, useState } from "react";

function buildShareText(report: WeeklyReport, goalTitle: string) {
  const distractionLine =
    report.distractionReductionPercent > 0
      ? `Distraction Reduced: ${report.distractionReductionPercent}%`
      : `Goal Time: ${formatMinutes(report.productiveMinutes)}`;
  return [
    "GoalOS AI Weekly",
    `Goal: ${goalTitle}`,
    `Identity: ${report.identity}`,
    `Goal Score: ${report.averageScore}/100`,
    distractionLine,
    TAGLINE,
  ].join("\n");
}

export function WeeklyIdentityCard({
  report,
  goalTitle,
  compact,
}: {
  report: WeeklyReport;
  goalTitle: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const shareText = buildShareText(report, goalTitle);

  const copyShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [shareText]);

  const shareNative = useCallback(async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "GoalOS Weekly", text: shareText });
        return;
      } catch {
        /* user cancelled */
      }
    }
    void copyShare();
  }, [shareText, copyShare]);

  return (
    <div
      className={`goalos-hero-card overflow-hidden bg-gradient-to-br from-[#22c55e]/15 via-transparent to-[#3b82f6]/10 ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="goalos-eyebrow">{report.weekLabel}</p>
          {!compact && (
            <h3 className="mt-1 text-lg font-semibold text-zinc-100">Weekly productivity identity</h3>
          )}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => void copyShare()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-400 hover:text-zinc-200"
            aria-label="Copy share card"
          >
            {copied ? <Check className="h-4 w-4 text-[#22c55e]" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => void shareNative()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-400 hover:text-zinc-200"
            aria-label="Share weekly card"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={`${compact ? "mt-3" : "mt-5"} space-y-1.5 rounded-lg border border-white/[0.06] bg-black/25 p-4 font-mono text-sm`}>
        <p className="text-zinc-500">GoalOS AI Weekly</p>
        <p className="text-zinc-300">Goal: {goalTitle}</p>
        <p className="text-[#22c55e]">Identity: {report.identity}</p>
        <p className="text-zinc-300">Goal Score: {report.averageScore}/100</p>
        <p className="text-zinc-300">Goal Time: {formatMinutes(report.productiveMinutes)}</p>
        {report.distractionReductionPercent > 0 && (
          <p className="text-zinc-300">
            Distraction Reduced: {report.distractionReductionPercent}%
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="text-zinc-500">Best focus</p>
          <p className="mt-1 font-medium text-zinc-200">{report.bestFocusWindow}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="text-zinc-500">Risk window</p>
          <p className="mt-1 font-medium text-amber-400">{report.riskWindow}</p>
        </div>
      </div>

      <p className="mt-4 text-xs italic text-zinc-500">{TAGLINE}</p>
      <p className="mt-2 text-xs text-zinc-600">Next week: {report.nextWeekGoal}</p>
    </div>
  );
}
