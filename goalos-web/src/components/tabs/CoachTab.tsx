"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, RefreshCw, Cpu, Loader2, Zap, Brain } from "lucide-react";
import type { CoachRecommendation, UserState } from "@/lib/types";
import type { WebLLMStatus } from "@/lib/web-llm-coach";
import { suggestedActions, suggestedPrompts } from "@/lib/coach";
import {
  CoachBubble,
  CoachChatInput,
  SuggestionChips,
} from "@/components/ui/GoalOSComponents";

function AiStatusBadge({
  status,
  isChecking,
}: {
  status: WebLLMStatus;
  isChecking: boolean;
}) {
  if (isChecking) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-zinc-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking GPU…
      </span>
    );
  }
  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2be7a8]/25 bg-[#2be7a8]/10 px-2.5 py-1 text-[10px] font-medium text-[#2be7a8]">
        <Zap className="h-3 w-3" />
        Browser AI live
      </span>
    );
  }
  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#68a7ff]/25 bg-[#68a7ff]/10 px-2.5 py-1 text-[10px] font-medium text-[#68a7ff]">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading model…
      </span>
    );
  }
  if (status === "unsupported") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-300">
        Smart coach
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-zinc-400">
      <Brain className="h-3 w-3" />
      Smart coach
    </span>
  );
}

export function CoachTab({
  state,
  coach,
  messages,
  thinking,
  webLLM,
  onSend,
  onAction,
  onRefresh,
  onStartSprint,
}: {
  state: UserState;
  coach: CoachRecommendation;
  messages: { id: string; role: "coach" | "user"; text: string; timestamp: string }[];
  thinking: boolean;
  webLLM: {
    status: WebLLMStatus;
    progress: number;
    progressText: string;
    error: string | null;
    loadModel: () => Promise<void>;
    isSupported: boolean;
    isChecking: boolean;
  };
  onSend: (text: string) => void;
  onAction: (action: string) => void;
  onRefresh: () => void;
  onStartSprint: () => void;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const actions = suggestedActions(state, coach);
  const prompts = suggestedPrompts(state);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, thinking]);

  const handleSend = () => {
    if (!input.trim() || thinking) return;
    onSend(input);
    setInput("");
  };

  const aiReady = webLLM.status === "ready";
  const aiLoading = webLLM.status === "loading";
  const showLoadButton =
    webLLM.isSupported && !aiReady && !aiLoading && !webLLM.isChecking;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex shrink-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2be7a8]/20 to-[#68a7ff]/15 ring-1 ring-[#2be7a8]/20">
            <Sparkles className="h-5 w-5 text-[#2be7a8]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-zinc-100">AI Coach</h2>
              <AiStatusBadge status={webLLM.status} isChecking={webLLM.isChecking} />
            </div>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Score {coach.scoreContext}/100 · {state.profile?.identity ?? "Your DNA"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="shrink-0 rounded-xl p-2 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
          aria-label="Refresh coach chat"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {showLoadButton && (
        <div className="goalos-card mb-3 shrink-0 border-[#68a7ff]/20 p-4">
          <div className="flex items-start gap-3">
            <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-[#68a7ff]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-200">Enable browser AI</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Downloads ~600MB once, then runs privately in Chrome/Edge. No API key.
              </p>
              <button
                type="button"
                onClick={() => void webLLM.loadModel()}
                className="goalos-btn-primary mt-3 px-4 py-2 text-xs"
              >
                Load browser AI
              </button>
            </div>
          </div>
        </div>
      )}

      {aiLoading && (
        <div className="goalos-card mb-3 shrink-0 p-3">
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#68a7ff]" />
              Downloading model… {webLLM.progress}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2be7a8] to-[#68a7ff] transition-all duration-300"
              style={{ width: `${Math.max(webLLM.progress, 2)}%` }}
            />
          </div>
          {webLLM.progressText && (
            <p className="mt-1.5 truncate text-[10px] text-zinc-600">{webLLM.progressText}</p>
          )}
        </div>
      )}

      {webLLM.status === "unsupported" && (
        <div className="goalos-card mb-3 shrink-0 border-amber-500/20 bg-amber-500/[0.04] p-3 text-xs leading-relaxed text-amber-200/90">
          WebGPU not detected — smart rule-based coach is active. For full browser AI, open in{" "}
          <strong className="font-medium">Chrome</strong> or <strong className="font-medium">Edge</strong>{" "}
          on desktop.
        </div>
      )}

      {webLLM.status === "error" && (
        <div className="goalos-card mb-3 shrink-0 border-rose-500/20 p-3">
          <p className="text-xs text-rose-300">{webLLM.error}</p>
          <button
            type="button"
            onClick={() => void webLLM.loadModel()}
            className="mt-2 text-xs font-medium text-[#68a7ff] hover:underline"
          >
            Retry loading browser AI
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
        {messages.map((msg) => (
          <CoachBubble key={msg.id} message={msg} />
        ))}
        {thinking && (
          <div className="coach-bubble-coach mr-auto flex max-w-[88%] items-center gap-2 px-4 py-3 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin text-[#2be7a8]" />
            {aiReady ? "Coach is thinking…" : "Generating reply…"}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 shrink-0 space-y-2.5 border-t border-white/5 pt-3">
        <SuggestionChips items={prompts.slice(0, 2)} onSelect={onSend} />
        <SuggestionChips
          items={actions.slice(0, 3)}
          onSelect={(action) => {
            if (action.toLowerCase().includes("sprint")) onStartSprint();
            onAction(action);
          }}
        />
        <CoachChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={thinking}
        />
        <p className="text-center text-[10px] text-zinc-600">
          {aiReady
            ? "Private · Runs on your device via WebLLM"
            : "Send a message anytime — smart coach replies instantly"}
        </p>
      </div>
    </div>
  );
}
