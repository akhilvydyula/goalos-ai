"use client";

import { useState } from "react";
import { GOAL_TEMPLATES } from "@/lib/constants";
import type { GoalTemplate, UserGoal } from "@/lib/types";
import { ChevronLeft } from "lucide-react";

export function GoalSetupStep({
  onBack,
  onComplete,
}: {
  onBack: () => void;
  onComplete: (goal: UserGoal) => void;
}) {
  const [template, setTemplate] = useState<GoalTemplate | null>(null);
  const [timelineWeeks, setTimelineWeeks] = useState(12);
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [focusWindow, setFocusWindow] = useState("Morning (9–12pm)");
  const [painPoint, setPainPoint] = useState("");
  const [motivation, setMotivation] = useState("");

  const selected = GOAL_TEMPLATES.find((g) => g.id === template);

  return (
    <div className="min-h-screen px-5 py-8">
      <button type="button" onClick={onBack} className="mb-6 flex items-center gap-1 text-zinc-400">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <h2 className="text-2xl font-semibold">Choose your goal</h2>
      <p className="mt-1 text-sm text-zinc-500">What are you working toward?</p>

      <div className="mt-6 space-y-3">
        {GOAL_TEMPLATES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setTemplate(g.id)}
            className={`goalos-card w-full p-4 text-left transition ${
              template === g.id ? "border-[#2be7a8]/50 ring-1 ring-[#2be7a8]/30" : ""
            }`}
          >
            <p className="font-medium text-zinc-100">{g.title}</p>
            <p className="mt-1 text-sm text-zinc-500">{g.description}</p>
          </button>
        ))}
      </div>

      {template && (
        <div className="mt-8 space-y-4">
          <Field label="Target timeline (weeks)">
            <input
              type="range"
              min={4}
              max={52}
              value={timelineWeeks}
              onChange={(e) => setTimelineWeeks(Number(e.target.value))}
              className="w-full accent-[#2be7a8]"
            />
            <span className="text-sm text-[#2be7a8]">{timelineWeeks} weeks</span>
          </Field>
          <Field label="Daily commitment (minutes)">
            <input
              type="range"
              min={15}
              max={180}
              step={15}
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="w-full accent-[#2be7a8]"
            />
            <span className="text-sm text-[#2be7a8]">{dailyMinutes} min/day</span>
          </Field>
          <Field label="Preferred focus window">
            <select
              value={focusWindow}
              onChange={(e) => setFocusWindow(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            >
              <option>Early morning (5–9am)</option>
              <option>Morning (9–12pm)</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </select>
          </Field>
          <Field label="Current pain point">
            <input
              value={painPoint}
              onChange={(e) => setPainPoint(e.target.value)}
              placeholder="e.g. I scroll YouTube instead of studying SQL"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-zinc-600"
            />
          </Field>
          <Field label="Why this matters to you">
            <input
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="e.g. I want financial freedom through a DE role"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-zinc-600"
            />
          </Field>
        </div>
      )}

      <button
        type="button"
        disabled={!template || !selected}
        onClick={() =>
          onComplete({
            template: template!,
            title: selected!.title,
            timelineWeeks,
            dailyCommitmentMinutes: dailyMinutes,
            focusWindow,
            painPoint: painPoint || "Distraction during focus windows",
            motivation: motivation || "Achieve my goal consistently",
          })
        }
        className="goalos-btn-primary mt-8 w-full py-4 disabled:opacity-40"
      >
        Continue to Productivity DNA
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-400">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
