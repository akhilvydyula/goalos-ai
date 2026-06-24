"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import type { CoachRecommendation, UserState } from "@/lib/types";
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
  onSend,
  onAction,
  onRefresh,
  onStartSprint,
}: {
  state: UserState;
  coach: CoachRecommendation;
  messages: { id: string; role: "coach" | "user"; text: string; timestamp: string }[];
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
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col lg:h-[calc(90dvh-8.5rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2be7a8]/15">
            <Sparkles className="h-4 w-4 text-[#2be7a8]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">AI Coach</h2>
            <p className="text-[11px] text-zinc-500">Score context: {coach.scoreContext}/100</p>
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

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((msg) => (
          <CoachBubble key={msg.id} message={msg} />
        ))}
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
        />
        <p className="text-center text-[10px] text-zinc-600">
          Rule-based coach · Add OPENAI_API_KEY for LLM mode (coming soon)
        </p>
      </div>
    </div>
  );
}
