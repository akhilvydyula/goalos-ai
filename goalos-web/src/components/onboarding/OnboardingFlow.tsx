"use client";

import { useState } from "react";
import type { UserState } from "@/lib/types";
import { TAGLINE, PRIVACY_PROMISE } from "@/lib/constants";
import { deriveProductivityProfile } from "@/lib/scoring";
import { GoalSetupStep } from "./GoalSetupStep";
import { DnaQuizStep } from "./DnaQuizStep";
import { Shield } from "lucide-react";

type Step = "welcome" | "goal" | "dna" | "privacy";

export function OnboardingFlow({
  state,
  persist,
}: {
  state: UserState;
  persist: (s: UserState) => void;
}) {
  const [step, setStep] = useState<Step>("welcome");

  if (step === "welcome") {
    return (
      <div className="flex min-h-dvh flex-col justify-between px-6 py-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#2be7a8]/80">
            GoalOS AI
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            <span className="goalos-gradient-text">{TAGLINE}</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Know where your time goes. Know who you are becoming.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Your phone is not the problem. Unconscious time is the problem.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStep("goal")}
          className="goalos-btn-primary w-full py-4 text-center"
        >
          Get Started
        </button>
      </div>
    );
  }

  if (step === "goal") {
    return (
      <GoalSetupStep
        onBack={() => setStep("welcome")}
        onComplete={(goal) => {
          persist({ ...state, goal });
          setStep("dna");
        }}
      />
    );
  }

  if (step === "dna") {
    return (
      <DnaQuizStep
        onBack={() => setStep("goal")}
        onComplete={(dna) => {
          const profile = deriveProductivityProfile(dna);
          persist({
            ...state,
            dna,
            profile,
            energyToday: dna.energyLevel,
            moodToday: Math.min(5, dna.energyLevel + 1),
          });
          setStep("privacy");
        }}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 py-10">
      <div className="goalos-card flex flex-1 flex-col p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2be7a8]/15">
          <Shield className="h-6 w-6 text-[#2be7a8]" />
        </div>
        <h2 className="text-2xl font-semibold">Privacy Promise</h2>
        <p className="mt-4 flex-1 leading-relaxed text-zinc-400">{PRIVACY_PROMISE}</p>
        <ul className="mt-4 space-y-2 text-sm text-zinc-500">
          <li>✓ App usage patterns only — no message or content reading</li>
          <li>✓ Local-first storage with export/delete controls</li>
          <li>✓ You control what the AI remembers</li>
        </ul>
      </div>
      <button
        type="button"
        onClick={() =>
          persist({
            ...state,
            privacyAccepted: true,
            onboarded: true,
          })
        }
        className="goalos-btn-primary mt-6 w-full py-4"
      >
        Accept & Continue
      </button>
      <p className="mt-3 text-center text-xs text-zinc-600">
        Demo mode uses simulated usage data. Android app uses UsageStatsManager.
      </p>
    </div>
  );
}
