"use client";

import { useState } from "react";
import type { OnboardingStep, UserState } from "@/lib/types";
import { TAGLINE, PRIVACY_PROMISE } from "@/lib/constants";
import { deriveProductivityProfile, calculateGoalAlignmentScore } from "@/lib/scoring";
import { createInstantDemoState } from "@/lib/demo-presets";
import { createScratchState } from "@/lib/storage";
import { generateRoadmap } from "@/lib/agent";
import { createFreshApps } from "@/lib/demo-data";
import { GoalSetupStep } from "./GoalSetupStep";
import { DnaQuizStep } from "./DnaQuizStep";
import { Shield, Sparkles, Zap } from "lucide-react";

function resolveStep(state: UserState): OnboardingStep {
  if (state.onboardingStep) return state.onboardingStep;
  if (state.goal && state.dna) return "privacy";
  if (state.goal) return "dna";
  return "welcome";
}

export function OnboardingFlow({
  state,
  persist,
}: {
  state: UserState;
  persist: (s: UserState) => void;
}) {
  const [step, setStep] = useState<OnboardingStep>(() => resolveStep(state));
  const [displayName, setDisplayName] = useState(state.displayName ?? "");

  const goTo = (next: OnboardingStep, patch: Partial<UserState> = {}) => {
    setStep(next);
    persist({ ...state, ...patch, onboardingStep: next });
  };

  if (step === "welcome") {
    return (
      <div className="flex h-full min-h-0 flex-col justify-between overflow-y-auto px-6 py-8">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-[#22c55e]" />
            Open source · Local-first
          </div>
          <p className="goalos-eyebrow">Welcome to GoalOS</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-zinc-50">
            {TAGLINE}
          </h1>
          <p className="mt-4 text-base text-zinc-400">
            Know where your time goes. Align every session with what you&apos;re building toward.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Your phone is not the problem. Unconscious time is the problem.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "Set your goal & Productivity DNA",
              "Track alignment from day one",
              "AI coach that learns with you",
            ].map((line) => (
              <div key={line} className="flex items-center gap-3 text-sm text-zinc-400">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#22c55e]/15 text-xs text-[#22c55e]">
                  ✓
                </span>
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-8 space-y-3">
          <button
            type="button"
            onClick={() => {
              const scratch = createScratchState();
              persist({ ...scratch, onboardingStep: "goal" });
              setStep("goal");
            }}
            className="goalos-btn-primary w-full py-4 text-center"
          >
            Get Started
          </button>
          <button
            type="button"
            onClick={() => persist(createInstantDemoState())}
            className="goalos-btn-secondary flex w-full items-center justify-center gap-2 py-4"
          >
            <Zap className="h-4 w-4 text-zinc-400" />
            Explore demo instantly
          </button>
          <p className="text-center text-[11px] text-zinc-600">
            Demo loads sample data — you can still log time and run sprints
          </p>
        </div>
      </div>
    );
  }

  if (step === "goal") {
    return (
      <GoalSetupStep
        onBack={() => goTo("welcome")}
        onComplete={(goal) => goTo("dna", { goal })}
      />
    );
  }

  if (step === "dna") {
    return (
      <DnaQuizStep
        onBack={() => goTo("goal")}
        onComplete={(dna) => {
          const profile = deriveProductivityProfile(dna);
          goTo("privacy", {
            dna,
            profile,
            energyToday: dna.energyLevel,
            moodToday: Math.min(5, dna.energyLevel + 1),
          });
        }}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto px-6 py-8">
      <div className="goalos-card flex flex-1 flex-col p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#22c55e]/15">
          <Shield className="h-6 w-6 text-[#22c55e]" />
        </div>
        <h2 className="text-2xl font-semibold">Privacy Promise</h2>
        <p className="mt-4 flex-1 leading-relaxed text-zinc-400">{PRIVACY_PROMISE}</p>
        <ul className="mt-4 space-y-2 text-sm text-zinc-500">
          <li>✓ App usage patterns only — no message or content reading</li>
          <li>✓ Local-first storage with export/delete controls</li>
          <li>✓ You control what the AI remembers</li>
        </ul>
        <label className="mt-6 block text-sm font-medium text-zinc-300">
          What should we call you?
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your first name"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#2be7a8]/40"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => {
          const apps = createFreshApps();
          const roadmap = state.goal ? generateRoadmap(state.goal, state.dna) : undefined;
          const initialScore = calculateGoalAlignmentScore({
            apps,
            roadmapProgress: 0,
            intentCheckIns: [],
            focusSprints: [],
            energyToday: state.energyToday,
            moodToday: state.moodToday,
          });
          persist({
            ...state,
            apps,
            focusSprints: [],
            intentCheckIns: [],
            roadmapProgress: 0,
            weeklyHistory: [initialScore.total],
            displayName: displayName.trim() || undefined,
            privacyAccepted: true,
            onboarded: true,
            onboardingStep: undefined,
            ...(roadmap ? { roadmap } : {}),
          });
        }}
        className="goalos-btn-primary mt-6 w-full py-4"
      >
        Accept & Continue
      </button>
      <p className="mt-3 text-center text-xs text-zinc-600">
        Your dashboard starts at zero — usage fills in as you track and act.
      </p>
    </div>
  );
}
