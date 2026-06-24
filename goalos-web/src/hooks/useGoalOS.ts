"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserState, TabId, AppClassification, IntentReason, CoachMessage } from "@/lib/types";
import { loadState, saveState } from "@/lib/storage";
import { calculateGoalAlignmentScore } from "@/lib/scoring";
import {
  generateCoachRecommendation,
  generateWeeklyReport,
  openingMessages,
  replyTo,
  createCoachMessage,
} from "@/lib/coach";

export function useGoalOS() {
  const [state, setState] = useState<UserState | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [intentAppId, setIntentAppId] = useState<string | null>(null);
  const [focusSprintOpen, setFocusSprintOpen] = useState(false);
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([]);

  useEffect(() => {
    setState(loadState());
  }, []);

  const persist = useCallback((next: UserState) => {
    setState(next);
    saveState(next);
  }, []);

  const update = useCallback((patch: Partial<UserState>) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  }, []);

  const score = useMemo(() => {
    if (!state) return null;
    return calculateGoalAlignmentScore({
      apps: state.apps,
      roadmapProgress: state.roadmapProgress,
      intentCheckIns: state.intentCheckIns,
      focusSprints: state.focusSprints,
      energyToday: state.energyToday,
      moodToday: state.moodToday,
    });
  }, [state]);

  const coach = useMemo(() => {
    if (!state || !score) return null;
    return generateCoachRecommendation({
      score,
      goal: state.goal,
      profile: state.profile,
      apps: state.apps,
    });
  }, [state, score]);

  const weeklyReport = useMemo(() => {
    if (!state) return null;
    return generateWeeklyReport({
      scores: state.weeklyHistory,
      apps: state.apps,
      identity: state.profile?.identity ?? "Consistent Builder",
      goalTitle: state.goal?.title ?? "Your Goal",
    });
  }, [state]);

  useEffect(() => {
    if (!state?.onboarded || !score || !coach) return;
    setCoachMessages(openingMessages(state, score, coach));
  }, [state?.onboarded, state?.goal?.title, score?.total, coach?.nextAction]);

  const sendCoachMessage = useCallback(
    (text: string) => {
      if (!state || !score || !coach || !text.trim()) return;
      const userMsg = createCoachMessage("user", text.trim());
      const coachReply = createCoachMessage("coach", replyTo(text, state, score, coach));
      setCoachMessages((prev) => [...prev, userMsg, coachReply]);
    },
    [state, score, coach]
  );

  const handleCoachAction = useCallback(
    (action: string) => {
      const lower = action.toLowerCase();
      if (lower.includes("sprint") || lower.includes("create")) {
        setFocusSprintOpen(true);
      }
      sendCoachMessage(action);
    },
    [sendCoachMessage]
  );

  const refreshCoachChat = useCallback(() => {
    if (!state || !score || !coach) return;
    setCoachMessages(openingMessages(state, score, coach));
  }, [state, score, coach]);

  const classifyApp = useCallback(
    (appId: string, classification: AppClassification) => {
      if (!state) return;
      persist({
        ...state,
        apps: state.apps.map((a) => (a.id === appId ? { ...a, classification } : a)),
      });
    },
    [state, persist]
  );

  const recordIntent = useCallback(
    (appId: string, reason: IntentReason, aligned: boolean) => {
      if (!state) return;
      persist({
        ...state,
        intentCheckIns: [
          ...state.intentCheckIns,
          { appId, reason, aligned, timestamp: new Date().toISOString() },
        ],
      });
      setIntentAppId(null);
    },
    [state, persist]
  );

  const completeFocusSprint = useCallback(
    (title: string, durationMinutes: number) => {
      if (!state) return;
      const sprint = {
        id: `sprint-${Date.now()}`,
        title,
        durationMinutes,
        startedAt: new Date(Date.now() - durationMinutes * 60000).toISOString(),
        completedAt: new Date().toISOString(),
        scoreBoost: durationMinutes >= 45 ? 8 : durationMinutes >= 25 ? 5 : 3,
      };
      persist({
        ...state,
        focusSprints: [...state.focusSprints, sprint],
        roadmapProgress: Math.min(100, state.roadmapProgress + 5),
      });
      setFocusSprintOpen(false);
      sendCoachMessage(`I completed a ${durationMinutes}-minute focus sprint`);
    },
    [state, persist, sendCoachMessage]
  );

  return {
    state,
    activeTab,
    setActiveTab,
    update,
    persist,
    score,
    coach,
    weeklyReport,
    coachMessages,
    sendCoachMessage,
    handleCoachAction,
    refreshCoachChat,
    classifyApp,
    recordIntent,
    intentAppId,
    setIntentAppId,
    focusSprintOpen,
    setFocusSprintOpen,
    completeFocusSprint,
  };
}
