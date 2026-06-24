"use client";

import { useEffect, useState } from "react";
import type { UserGoal } from "@/lib/types";
import { X, Play, CheckCircle } from "lucide-react";

const DURATIONS = [15, 25, 45, 60];

export function FocusSprintModal({
  goal,
  onComplete,
  onClose,
}: {
  goal?: UserGoal;
  onComplete: (title: string, durationMinutes: number) => void;
  onClose: () => void;
}) {
  const [duration, setDuration] = useState(25);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [done, setDone] = useState(false);

  const sprintTitle =
    goal?.template === "data-engineering-job"
      ? "SQL Sprint"
      : goal?.template === "software-interview"
        ? "DSA Sprint"
        : goal?.template === "founder-mode"
          ? "Build Sprint"
          : "Focus Sprint";

  useEffect(() => {
    if (!running || done) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setDone(true);
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, done]);

  const start = () => {
    setSecondsLeft(duration * 60);
    setRunning(true);
    setDone(false);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="goalos-card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-[#2be7a8]/80">
            Focus Sprint
          </p>
          <button type="button" onClick={onClose} className="text-zinc-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-emerald-400" />
            <h2 className="mt-4 text-2xl font-semibold">Sprint Complete!</h2>
            <p className="mt-2 text-sm text-zinc-500">+5 to your Goal Alignment Score</p>
            <button
              type="button"
              onClick={() => onComplete(sprintTitle, duration)}
              className="mt-6 w-full goalos-btn-primary"
            >
              Done
            </button>
          </div>
        ) : running ? (
          <div className="py-8 text-center">
            <p className="text-sm text-zinc-500">{sprintTitle}</p>
            <p className="mt-4 font-mono text-6xl font-bold tabular-nums text-[#2be7a8]">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </p>
            <p className="mt-4 text-sm text-zinc-500 animate-pulse-soft">Stay focused...</p>
          </div>
        ) : (
          <>
            <h2 className="mt-2 text-xl font-semibold">{sprintTitle}</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Time-boxed goal action. Complete to boost your score and roadmap progress.
            </p>
            <div className="mt-6 flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 rounded-xl py-2 text-sm font-medium ${
                    duration === d
                      ? "bg-[#2be7a8] text-[#06070d]"
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={start}
              className="goalos-btn-primary mt-6 flex w-full items-center justify-center gap-2 py-4"
            >
              <Play className="h-5 w-5" /> Start Sprint
            </button>
          </>
        )}
      </div>
    </div>
  );
}
