"use client";

import { useCallback, useMemo, useState } from "react";
import type { UserState, TabId, AppClassification, IntentReason, CoachMessage } from "@/lib/types";
import { loadState, saveState } from "@/lib/storage";
import { calculateGoalAlignmentScore } from "@/lib/scoring";
import {
  generateCoachRecommendation,
  generateWeeklyReport,
  openingMessages,
  createCoachMessage,
} from "@/lib/coach";
import { generateCoachReplyWithWebLLM, fallbackCoachReply } from "@/lib/web-llm-coach";
import { useWebLLM } from "@/hooks/useWebLLM";

export function useGoalOS() {
  const [state, setState] = useState<UserState | null>(() => {
    if (typeof window === "undefined") return null;
    return loadState();
  });
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [intentAppId, setIntentAppId] = useState<string | null>(null);
  const [focusSprintOpen, setFocusSprintOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<CoachMessage[]>([]);
  const [coachThinking, setCoachThinking] = useState(false);

  const webLLM = useWebLLM(activeTab === "coach");

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

  const openingCoachMessages = useMemo(() => {
    if (!state?.onboarded || !score || !coach) return [];
    return openingMessages(state, score, coach);
  }, [state, score, coach]);

  const coachMessages = useMemo(
    () => [...openingCoachMessages, ...chatMessages],
    [openingCoachMessages, chatMessages]
  );

  const sendCoachMessage = useCallback(
    async (text: string) => {
      if (!state || !score || !coach || !text.trim() || coachThinking) return;

      const trimmed = text.trim();
      const userMsg = createCoachMessage("user", trimmed);
      setChatMessages((prev) => [...prev, userMsg]);
      setCoachThinking(true);

      let replyText: string;

      if (webLLM.isSupported) {
        const ready = await webLLM.ensureReady();
        if (ready) {
          try {
            replyText = await generateCoachReplyWithWebLLM({
              state,
              score,
              coach,
              history: [...coachMessages, userMsg],
              userMessage: trimmed,
            });
          } catch (err) {
            console.warn("[GoalOS] WebLLM reply failed, using smart coach:", err);
            replyText = fallbackCoachReply(trimmed, state, score, coach);
          }
        } else {
          replyText = fallbackCoachReply(trimmed, state, score, coach);
        }
      } else {
        replyText = fallbackCoachReply(trimmed, state, score, coach);
      }

      setChatMessages((prev) => [...prev, createCoachMessage("coach", replyText)]);
      setCoachThinking(false);
    },
    [state, score, coach, coachMessages, coachThinking, webLLM]
  );

  const handleCoachAction = useCallback(
    (action: string) => {
      const lower = action.toLowerCase();
      if (lower.includes("sprint") || lower.includes("create")) {
        setFocusSprintOpen(true);
      }
      void sendCoachMessage(action);
    },
    [sendCoachMessage]
  );

  const refreshCoachChat = useCallback(() => {
    setChatMessages([]);
  }, []);

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
      void sendCoachMessage(`I completed a ${durationMinutes}-minute focus sprint`);
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
    coachThinking,
    sendCoachMessage,
    handleCoachAction,
    refreshCoachChat,
    webLLM,
    classifyApp,
    recordIntent,
    intentAppId,
    setIntentAppId,
    focusSprintOpen,
    setFocusSprintOpen,
    completeFocusSprint,
  };
}
