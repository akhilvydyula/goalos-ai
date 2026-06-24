"use client";

import { useState } from "react";
import { DNA_QUESTIONS } from "@/lib/constants";
import type { DnaAnswers } from "@/lib/types";
import { ChevronLeft } from "lucide-react";

export function DnaQuizStep({
  onBack,
  onComplete,
}: {
  onBack: () => void;
  onComplete: (dna: DnaAnswers) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<DnaAnswers>>({
    distractingApps: [],
    energyLevel: 3,
  });

  const q = DNA_QUESTIONS[index];
  const progress = ((index + 1) / DNA_QUESTIONS.length) * 100;

  const canNext = () => {
    const key = q.id as keyof DnaAnswers;
    const val = answers[key];
    if (q.id === "distractingApps") return Array.isArray(val) && val.length > 0;
    if (q.id === "energyLevel") return typeof val === "number";
    return typeof val === "string" && val.length > 0;
  };

  const finish = () => {
    onComplete({
      distractionTime: answers.distractionTime ?? "Evening",
      distractingApps: answers.distractingApps ?? [],
      distractionTrigger: answers.distractionTrigger ?? "Boredom",
      bestFocusTime: answers.bestFocusTime ?? "Morning (9–12pm)",
      energyLevel: answers.energyLevel ?? 3,
      coachingTone: answers.coachingTone ?? "Supportive",
      goalBlocker: answers.goalBlocker ?? "Unclear next step",
    });
  };

  const next = () => {
    if (index < DNA_QUESTIONS.length - 1) setIndex(index + 1);
    else finish();
  };

  return (
    <div className="min-h-screen px-5 py-8">
      <button type="button" onClick={onBack} className="mb-4 flex items-center gap-1 text-zinc-400">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <p className="text-xs font-medium uppercase tracking-widest text-[#2be7a8]/80">
        Productivity DNA · {index + 1}/{DNA_QUESTIONS.length}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-[#2be7a8] transition-all" style={{ width: `${progress}%` }} />
      </div>
      <h2 className="mt-6 text-xl font-semibold leading-snug">{q.question}</h2>

      <div className="mt-6 space-y-2">
        {"options" in q &&
          q.options?.map((opt) => {
            const key = q.id as keyof DnaAnswers;
            if (q.id === "distractingApps") {
              const selected = (answers.distractingApps ?? []).includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    const current = answers.distractingApps ?? [];
                    const nextApps = selected
                      ? current.filter((a) => a !== opt)
                      : [...current, opt];
                    setAnswers({ ...answers, distractingApps: nextApps });
                  }}
                  className={`goalos-card w-full p-4 text-left ${
                    selected ? "border-[#2be7a8]/50" : ""
                  }`}
                >
                  {opt}
                </button>
              );
            }
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setAnswers({ ...answers, [key]: opt })}
                className={`goalos-card w-full p-4 text-left ${
                  answers[key] === opt ? "border-[#2be7a8]/50" : ""
                }`}
              >
                {opt}
              </button>
            );
          })}

        {q.id === "energyLevel" && (
          <div className="goalos-card p-6">
            <input
              type="range"
              min={1}
              max={5}
              value={answers.energyLevel ?? 3}
              onChange={(e) =>
                setAnswers({ ...answers, energyLevel: Number(e.target.value) })
              }
              className="w-full accent-[#2be7a8]"
            />
            <div className="mt-4 flex justify-between text-sm text-zinc-500">
              <span>Low</span>
              <span className="text-2xl font-bold text-[#2be7a8]">
                {answers.energyLevel ?? 3}
              </span>
              <span>High</span>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!canNext()}
        onClick={next}
        className="goalos-btn-primary mt-8 w-full py-4 disabled:opacity-40"
      >
        {index < DNA_QUESTIONS.length - 1 ? "Next" : "See my Productivity DNA"}
      </button>
    </div>
  );
}
