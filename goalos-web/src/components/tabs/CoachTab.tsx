"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, RefreshCw, Cpu, Loader2 } from "lucide-react";
import type { CoachRecommendation, UserState } from "@/lib/types";
import type { WebLLMStatus } from "@/lib/web-llm-coach";
import { suggestedActions, suggestedPrompts } from "@/lib/coach";
import {
  CoachBubble,
  CoachChatInput,
  SuggestionChips,
} from "@/components/ui/GoalOSComponents";

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
  layout = "mobile",
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
  };
  onSend: (text: string) => void;
  onAction: (action: string) => void;
  onRefresh: () => void;
  onStartSprint: () => void;
  layout?: "web" | "mobile";
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

  return (
    <div
      className={
        layout === "web"
          ? "flex min-h-[28rem] flex-col lg:min-h-[36rem]"
          : "flex h-[calc(100dvh-8.5rem)] flex-col lg:h-[calc(90dvh-8.5rem)]"
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2be7a8]/15">
            <Sparkles className="h-4 w-4 text-[#2be7a8]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">AI Coach</h2>
            <p className="text-[11px] text-zinc-500">
              Score {coach.scoreContext}/100 ·{" "}
              {aiReady ? "Browser AI active" : aiLoading ? "Loading model…" : "Smart fallback"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
          aria-label="Refresh coach chat"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {(aiLoading || webLLM.status === "idle") && webLLM.isSupported && (
        <div className="goalos-card mb-3 p-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Cpu className="h-3.5 w-3.5 text-[#68a7ff]" />
            <span>
              {aiLoading
                ? `Downloading browser AI… ${webLLM.progress}%`
                : "Preparing on-device AI (no API key needed)"}
            </span>
          </div>
          {aiLoading && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2be7a8] to-[#68a7ff] transition-all"
                style={{ width: `${webLLM.progress}%` }}
              />
            </div>
          )}
          {webLLM.progressText && aiLoading && (
            <p className="mt-1 truncate text-[10px] text-zinc-600">{webLLM.progressText}</p>
          )}
        </div>
      )}

      {webLLM.status === "unsupported" && (
        <div className="goalos-card mb-3 border-amber-500/20 p-3 text-xs text-amber-200/90">
          WebGPU not detected — using smart rule-based coach. Open in Chrome or Edge for browser AI.
        </div>
      )}

      {webLLM.status === "error" && (
        <div className="goalos-card mb-3 border-rose-500/20 p-3">
          <p className="text-xs text-rose-300">{webLLM.error}</p>
          <button
            type="button"
            onClick={() => void webLLM.loadModel()}
            className="mt-2 text-xs font-medium text-[#68a7ff]"
          >
            Retry loading browser AI
          </button>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
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

      <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
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
            ? "Runs locally in your browser via WebLLM — private, no API key"
            : "Smart coach active · Browser AI loads automatically on this tab"}
        </p>
      </div>
    </div>
  );
}
