"use client";

import { Sparkles, Send } from "lucide-react";
import type { CoachMessage } from "@/lib/types";

export function CoachBubble({ message }: { message: CoachMessage }) {
  const isCoach = message.role === "coach";
  return (
    <div
      className={`animate-fade-up max-w-[88%] px-4 py-3 text-sm leading-relaxed ${
        isCoach ? "coach-bubble-coach mr-auto text-zinc-200" : "coach-bubble-user ml-auto text-zinc-100"
      }`}
    >
      {message.text}
    </div>
  );
}

export function MobileHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/5 bg-[#06070d]/90 px-5 py-4 backdrop-blur-xl">
      {eyebrow && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2be7a8]/80">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-0.5 text-lg font-semibold text-zinc-50">{title}</h1>
      {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
    </header>
  );
}

export function MetricCard({
  label,
  value,
  accent = "default",
}: {
  label: string;
  value: string;
  accent?: "default" | "positive" | "warning";
}) {
  const valueColor =
    accent === "positive"
      ? "text-[#2be7a8]"
      : accent === "warning"
        ? "text-amber-400"
        : "text-zinc-100";

  return (
    <div className="goalos-card p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-1.5 text-xl font-semibold tabular-nums ${valueColor}`}>{value}</p>
    </div>
  );
}

export function HeroCard({
  title,
  body,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="goalos-card goalos-card-glow p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#2be7a8]/15 p-2.5 text-[#2be7a8]">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#68a7ff]/90">
            {title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{body}</p>
          <button type="button" onClick={onAction} className="goalos-btn-primary mt-4 px-4 py-2.5 text-sm">
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CoachChatInput({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 pl-4">
      <Sparkles className="h-4 w-4 shrink-0 text-[#2be7a8]/70" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !disabled && value.trim() && onSend()}
        placeholder="Ask your coach..."
        className="min-w-0 flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2be7a8]/20 text-[#2be7a8] transition hover:bg-[#2be7a8]/30 disabled:opacity-40"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}

export function SuggestionChips({
  items,
  onSelect,
}: {
  items: string[];
  onSelect: (item: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button key={item} type="button" onClick={() => onSelect(item)} className="goalos-chip">
          {item}
        </button>
      ))}
    </div>
  );
}
