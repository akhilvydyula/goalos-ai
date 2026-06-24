"use client";

import { useState } from "react";
import type { TrackedApp, IntentReason } from "@/lib/types";
import { INTENT_OPTIONS } from "@/lib/constants";
import { classifyIntentText } from "@/lib/agent";
import { X, Sparkles } from "lucide-react";

export function IntentGateModal({
  app,
  onSelect,
  onClose,
}: {
  app: TrackedApp;
  onSelect: (reason: IntentReason, aligned: boolean) => void;
  onClose: () => void;
}) {
  const [freeText, setFreeText] = useState("");
  const [classification, setClassification] = useState<ReturnType<typeof classifyIntentText> | null>(
    null
  );

  const runClassifier = () => {
    if (!freeText.trim()) return;
    setClassification(classifyIntentText(freeText, app.name));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="goalos-card w-full max-w-md p-6 animate-in slide-in-from-bottom">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#2be7a8]/80">
              Intent Gate
            </p>
            <h2 className="mt-1 text-xl font-semibold">Why open {app.name}?</h2>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          Pause before unconscious scrolling. Your choice affects your Goal Alignment Score.
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Or describe in your own words
          </label>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={freeText}
              onChange={(e) => {
                setFreeText(e.target.value);
                setClassification(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && runClassifier()}
              placeholder="e.g. watching a SQL tutorial"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-[#2be7a8]/30"
            />
            <button
              type="button"
              onClick={runClassifier}
              disabled={!freeText.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-[#2be7a8]/15 px-3 py-2 text-xs font-medium text-[#2be7a8] disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Classify
            </button>
          </div>
          {classification && (
            <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs text-zinc-400">{classification.explanation}</p>
              <button
                type="button"
                onClick={() => onSelect(classification.reason, classification.aligned)}
                className={`mt-2 w-full rounded-lg py-2 text-sm font-medium ${
                  classification.aligned
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/15 text-amber-300"
                }`}
              >
                Confirm — {classification.reason.replace("-", " ")}
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {INTENT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id as IntentReason, opt.aligned)}
              className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                opt.aligned
                  ? "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
