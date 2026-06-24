import type { TabId } from "@/lib/types";
import { Crown } from "lucide-react";

const MODE_BADGE: Record<"demo" | "live", { label: string; className: string }> = {
  demo: { label: "Sample data", className: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
  live: { label: "Web demo", className: "border-[#68a7ff]/30 bg-[#68a7ff]/10 text-[#68a7ff]" },
};

export function MobileTopBar({
  displayName,
  demoMode,
  onProfile,
}: {
  displayName?: string;
  demoMode?: boolean;
  onProfile?: () => void;
}) {
  const mode = demoMode ? MODE_BADGE.demo : MODE_BADGE.live;

  return (
    <header className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3">
      <h1 className="text-lg font-bold tracking-tight text-zinc-50">GoalOS AI</h1>
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${mode.className}`}
        >
          {mode.label}
        </span>
        <button
          type="button"
          onClick={onProfile}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2be7a8]/40 to-[#68a7ff]/40 text-sm font-bold text-white ring-2 ring-white/10"
        >
          {(displayName ?? "A")[0]}
        </button>
      </div>
    </header>
  );
}

const tabs: { id: TabId; label: string }[] = [
  { id: "today", label: "Dashboard" },
  { id: "goal", label: "Goals" },
  { id: "coach", label: "Focus" },
  { id: "insights", label: "Insights" },
];

export function MobileTabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
}) {
  return (
    <div className="flex shrink-0 gap-1 border-b border-white/[0.06] px-4">
      {tabs.map(({ id, label }) => {
        const isActive =
          active === id || (id === "today" && active === "you");
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`relative px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? "text-[#2be7a8]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {label}
            {isActive && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#2be7a8]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
