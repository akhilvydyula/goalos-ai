import type { TabId } from "@/lib/types";
import { Calendar, Target, Sparkles, BarChart3, User } from "lucide-react";

const tabs: { id: TabId; label: string; icon: typeof Calendar }[] = [
  { id: "today", label: "Today", icon: Calendar },
  { id: "goal", label: "Goal", icon: Target },
  { id: "coach", label: "Coach", icon: Sparkles },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "you", label: "You", icon: User },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
}) {
  return (
    <nav className="goalos-nav-glass z-20 shrink-0">
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-2 transition-all ${
                isActive
                  ? "text-[#2be7a8]"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <span className="h-0.5 w-4 rounded-full bg-[#2be7a8]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
