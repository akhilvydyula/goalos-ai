import type { TabId } from "@/lib/types";
import { Calendar, Target, Sparkles, BarChart3, User } from "lucide-react";

const tabs: { id: TabId; label: string; icon: typeof Calendar }[] = [
  { id: "today", label: "Today", icon: Calendar },
  { id: "goal", label: "Goal", icon: Target },
  { id: "coach", label: "Coach", icon: Sparkles },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "you", label: "Profile", icon: User },
];

export function SidebarNav({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
}) {
  return (
    <nav className="goalos-card flex w-full shrink-0 flex-row gap-1 overflow-x-auto p-1.5 lg:w-52 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:p-2">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all lg:flex-none lg:justify-start ${
              isActive
                ? "bg-gradient-to-r from-[#2be7a8]/20 to-[#68a7ff]/10 text-[#2be7a8] ring-1 ring-[#2be7a8]/20"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${isActive ? "stroke-[2.5px]" : ""}`} />
            <span className="hidden lg:inline">{label}</span>
            <span className="lg:hidden">{label.split(" ")[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}
