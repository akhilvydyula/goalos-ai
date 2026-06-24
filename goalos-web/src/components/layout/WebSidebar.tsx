import type { TabId } from "@/lib/types";
import {
  LayoutDashboard,
  Target,
  FolderKanban,
  CheckSquare,
  Clock,
  Repeat,
  FileText,
  BarChart3,
  Sparkles,
  BookOpen,
  Settings,
  Flame,
} from "lucide-react";

type NavItem = {
  id: TabId | null;
  label: string;
  icon: typeof LayoutDashboard;
};

const nav: NavItem[] = [
  { id: "today", label: "Dashboard", icon: LayoutDashboard },
  { id: "goal", label: "Goals", icon: Target },
  { id: "goal", label: "Projects", icon: FolderKanban },
  { id: "today", label: "Tasks", icon: CheckSquare },
  { id: "insights", label: "Time", icon: Clock },
  { id: "insights", label: "Habits", icon: Repeat },
  { id: "insights", label: "Reviews", icon: FileText },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "coach", label: "AI Coach", icon: Sparkles },
  { id: null, label: "Resources", icon: BookOpen },
  { id: "you", label: "Settings", icon: Settings },
];

const PRIMARY_NAV: Record<TabId, string> = {
  today: "Dashboard",
  goal: "Goals",
  coach: "AI Coach",
  insights: "Insights",
  you: "Settings",
};

export function WebSidebar({
  active,
  onChange,
  displayName,
  streak,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
  displayName?: string;
  streak?: number;
}) {
  return (
    <aside className="goalos-sidebar hidden w-56 shrink-0 flex-col lg:flex">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2be7a8] to-[#68a7ff]">
          <Target className="h-5 w-5 text-[#06070d]" />
        </div>
        <span className="text-lg font-bold tracking-tight text-zinc-50">GoalOS</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {nav.map((item, i) => {
          const isActive =
            item.id !== null && active === item.id && item.label === PRIMARY_NAV[active];
          const disabled = !item.id || item.label !== PRIMARY_NAV[item.id];
          return (
            <button
              key={`${item.label}-${i}`}
              type="button"
              onClick={() => item.id && onChange(item.id)}
              disabled={disabled}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#2be7a8]/20 to-[#68a7ff]/10 text-[#2be7a8] shadow-sm ring-1 ring-[#2be7a8]/15"
                  : !disabled
                    ? "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    : "cursor-default text-zinc-600 opacity-60"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <div className="goalos-card flex items-center gap-3 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2be7a8]/30 to-[#68a7ff]/30 text-sm font-bold text-zinc-100">
            {(displayName ?? "U")[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-200">
              {displayName ?? "User"}
            </p>
            <p className="flex items-center gap-1 text-[11px] text-[#2be7a8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2be7a8]" />
              Focus Mode
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#2be7a8]/10 px-3 py-2.5">
          <Flame className="h-4 w-4 text-[#2be7a8]" />
          <span className="text-xs font-medium text-zinc-300">
            Focus sprints today: <span className="text-[#2be7a8]">{streak ?? 0}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
