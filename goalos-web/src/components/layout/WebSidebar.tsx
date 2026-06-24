import Link from "next/link";
import type { TabId, FocusSprint } from "@/lib/types";
import {
  LayoutDashboard,
  Target,
  BarChart3,
  Sparkles,
  Settings,
  Flame,
  Shield,
  LogOut,
  Building2,
} from "lucide-react";
import { sprintsTodayCount } from "@/lib/app-metrics";

const nav: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "today", label: "Dashboard", icon: LayoutDashboard },
  { id: "goal", label: "Goals", icon: Target },
  { id: "coach", label: "AI Coach", icon: Sparkles },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "you", label: "Settings", icon: Settings },
];

export function WebSidebar({
  active,
  onChange,
  displayName,
  focusSprints,
  focusSprintOpen,
  enterprise,
  orgName,
  plan,
  canAdmin,
  onSignOut,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
  displayName?: string;
  focusSprints?: FocusSprint[];
  focusSprintOpen?: boolean;
  enterprise?: boolean;
  orgName?: string;
  plan?: string;
  canAdmin?: boolean;
  onSignOut?: () => void;
}) {
  const sprintsToday = sprintsTodayCount(focusSprints ?? []);
  const focusActive = focusSprintOpen || sprintsToday > 0;

  return (
    <aside className="goalos-sidebar hidden w-60 shrink-0 flex-col lg:flex">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e]">
          <Target className="h-4 w-4 text-zinc-950" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-semibold text-zinc-100">GoalOS</span>
          {enterprise && orgName ? (
            <p className="flex items-center gap-1 truncate text-[11px] text-zinc-500">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{orgName}</span>
              {plan && (
                <span className="shrink-0 rounded border border-white/[0.08] px-1 text-[9px] uppercase">
                  {plan}
                </span>
              )}
            </p>
          ) : (
            <p className="text-[11px] text-zinc-500">Productivity OS</p>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`goalos-nav-item ${isActive ? "goalos-nav-item-active" : ""}`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
        {enterprise && canAdmin && (
          <Link
            href="/app/admin"
            className="goalos-nav-item mt-2 border-t border-white/[0.06] pt-3"
          >
            <Shield className="h-4 w-4 shrink-0" />
            Admin
          </Link>
        )}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200">
            {(displayName ?? "U")[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-200">
              {displayName ?? "User"}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span
                className={`h-1.5 w-1.5 rounded-full ${focusActive ? "bg-[#22c55e]" : "bg-zinc-600"}`}
              />
              {focusSprintOpen ? "Sprint active" : focusActive ? "Focus on" : "Ready"}
            </p>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
          <Flame className="h-3.5 w-3.5 text-[#22c55e]" />
          Sprints today: <span className="font-medium text-zinc-300">{sprintsToday}</span>
        </p>
        {enterprise && onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.06] px-3 py-2 text-xs text-zinc-500 transition hover:border-white/[0.1] hover:text-zinc-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
