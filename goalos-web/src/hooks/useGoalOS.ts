"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  detectToolsFromMessage,
  executeAgentTools,
  mergeActionResults,
  enrichWeeklyReport,
  type SprintPrefill,
} from "@/lib/agent";
import { addAppMinutes, primaryGoalAppId, withScoreSnapshot } from "@/lib/state-sync";

export function useGoalOS() {
  const [state, setState] = useState<UserState | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [intentAppId, setIntentAppId] = useState<string | null>(null);
  const [focusSprintOpen, setFocusSprintOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<CoachMessage[]>([]);
  const [coachThinking, setCoachThinking] = useState(false);
  const [sprintPrefill, setSprintPrefill] = useState<SprintPrefill | null>(null);

  const webLLM = useWebLLM(activeTab === "coach");

  useEffect(() => {
    setState(loadState());
  }, []);

  const persist = useCallback((next: UserState) => {
    setState(next);
    saveState(next);
  }, []);

  const commit = useCallback(
    (next: UserState) => {
      persist(withScoreSnapshot(next));
    },
    [persist]
  );

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
    if (!state || !score) return null;
    const base = generateWeeklyReport({
      scores: state.weeklyHistory,
      apps: state.apps,
      identity: state.profile?.identity ?? "Consistent Builder",
      goalTitle: state.goal?.title ?? "Your Goal",
    });
    return enrichWeeklyReport({
      base,
      score,
      apps: state.apps,
      identity: state.profile?.identity ?? "Consistent Builder",
      goalTitle: state.goal?.title ?? "Your Goal",
      weeklyHistory: state.weeklyHistory,
    });
  }, [state, score]);

  const openingCoachMessages = useMemo(() => {
    if (!state?.onboarded || !score || !coach) return [];
    return openingMessages(state, score, coach);
  }, [state, score, coach]);

  const coachMessages = useMemo(
    () => [...openingCoachMessages, ...chatMessages],
    [openingCoachMessages, chatMessages]
  );

  const applyAgentSideEffects = useCallback(
    (merged: ReturnType<typeof mergeActionResults>) => {
      if (merged.sprintPrefill) {
        setSprintPrefill(merged.sprintPrefill);
        setFocusSprintOpen(true);
      }
      if (merged.intentAppId) {
        setIntentAppId(merged.intentAppId);
      }
      if (merged.navigateTab) {
        setActiveTab(merged.navigateTab as TabId);
      }
      if (merged.statePatch) {
        setState((prev) => {
          if (!prev) return prev;
          const next = withScoreSnapshot({ ...prev, ...merged.statePatch });
          saveState(next);
          return next;
        });
      }
    },
    [state, persist]
  );

  const sendCoachMessage = useCallback(
    async (text: string) => {
      if (!state || !score || !coach || !text.trim() || coachThinking) return;

      const trimmed = text.trim();
      const userMsg = createCoachMessage("user", trimmed);
      setChatMessages((prev) => [...prev, userMsg]);
      setCoachThinking(true);

      const agentCtx = { state, score, coach, userMessage: trimmed };
      const toolCalls = detectToolsFromMessage(agentCtx);
      const merged = mergeActionResults(executeAgentTools(toolCalls, agentCtx));

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

      if (merged.replySuffix && !replyText.includes(merged.replySuffix.trim())) {
        replyText += merged.replySuffix;
      }

      setChatMessages((prev) => [...prev, createCoachMessage("coach", replyText)]);
      applyAgentSideEffects(merged);
      setCoachThinking(false);
    },
    [state, score, coach, coachMessages, coachThinking, webLLM, applyAgentSideEffects]
  );

  const handleCoachAction = useCallback(
    (action: string) => {
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
      commit({
        ...state,
        apps: state.apps.map((a) => (a.id === appId ? { ...a, classification } : a)),
      });
    },
    [state, commit]
  );

  const logAppUsage = useCallback(
    (appId: string, minutes: number) => {
      if (!state || minutes <= 0) return;
      commit(addAppMinutes(state, appId, minutes));
    },
    [state, commit]
  );

  const recordIntent = useCallback(
    (appId: string, reason: IntentReason, aligned: boolean) => {
      if (!state) return;
      let next: UserState = {
        ...state,
        intentCheckIns: [
          ...state.intentCheckIns,
          { appId, reason, aligned, timestamp: new Date().toISOString() },
        ],
      };
      if (!aligned) {
        next = addAppMinutes(next, appId, 10);
      } else {
        next = withScoreSnapshot(next);
      }
      persist(next);
      setIntentAppId(null);
    },
    [state, persist]
  );

  const openFocusSprint = useCallback((prefill?: SprintPrefill) => {
    if (prefill) setSprintPrefill(prefill);
    setFocusSprintOpen(true);
  }, []);

  const closeFocusSprint = useCallback(() => {
    setFocusSprintOpen(false);
    setSprintPrefill(null);
  }, []);

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
      let nextState: UserState = {
        ...state,
        focusSprints: [...state.focusSprints, sprint],
        roadmapProgress: Math.min(100, state.roadmapProgress + 5),
      };
      const goalAppId = primaryGoalAppId(nextState);
      if (goalAppId) {
        nextState = addAppMinutes(nextState, goalAppId, durationMinutes);
      } else {
        nextState = withScoreSnapshot(nextState);
      }
      persist(nextState);
      closeFocusSprint();
      void sendCoachMessage(`I completed a ${durationMinutes}-minute focus sprint`);
    },
    [state, persist, sendCoachMessage, closeFocusSprint]
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
    logAppUsage,
    recordIntent,
    intentAppId,
    setIntentAppId,
    focusSprintOpen,
    openFocusSprint,
    closeFocusSprint,
    sprintPrefill,
    completeFocusSprint,
  };
}
