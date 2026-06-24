"use client";

import { useState } from "react";
import type { UserState, WeeklyReport } from "@/lib/types";
import { PRIVACY_PROMISE, TAGLINE } from "@/lib/constants";
import { exportState } from "@/lib/storage";
import { WeeklyIdentityCard } from "@/components/ui/WeeklyIdentityCard";
import { Download, Trash2, Share2 } from "lucide-react";

export function ProfileTab({
  state,
  weeklyReport,
  onReset,
}: {
  state: UserState;
  weeklyReport: WeeklyReport;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const shareText = `GoalOS AI Weekly
Goal: ${state.goal?.title ?? "My Goal"}
Identity: ${weeklyReport.identity}
Goal Score: ${weeklyReport.averageScore}/100
Goal Time: ${Math.round(weeklyReport.productiveMinutes / 60)}h
Distraction Reduced: ${weeklyReport.distractionReductionPercent}%
${TAGLINE}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "GoalOS Weekly", text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    const blob = new Blob([exportState(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "goalos-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="goalos-card p-5 text-center">
        <p className="text-3xl font-bold goalos-gradient-text">{state.profile?.identity}</p>
        <p className="mt-2 text-sm text-zinc-500">Your Productivity Identity</p>
      </div>

      <WeeklyIdentityCard report={weeklyReport} goalTitle={state.goal?.title ?? "Your Goal"} compact />

      <div className="goalos-card p-4">
        <h3 className="text-sm font-medium">Privacy Center</h3>
        <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{PRIVACY_PROMISE}</p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm"
          >
            <Download className="h-4 w-4" /> Export my data
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 py-3 text-sm text-rose-400"
          >
            <Trash2 className="h-4 w-4" /> Delete all data
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="goalos-btn-primary flex w-full items-center justify-center gap-2 py-4"
      >
        <Share2 className="h-5 w-5" />
        {copied ? "Copied to clipboard!" : "Share Weekly Identity"}
      </button>
    </div>
  );
}
