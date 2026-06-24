"use client";

import type { TrackedApp, IntentReason } from "@/lib/types";
import { INTENT_OPTIONS } from "@/lib/constants";
import { X } from "lucide-react";

export function IntentGateModal({
  app,
  onSelect,
  onClose,
}: {
  app: TrackedApp;
  onSelect: (reason: IntentReason, aligned: boolean) => void;
  onClose: () => void;
}) {
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
