import { Search, Sparkles } from "lucide-react";
import { dashboardGreeting } from "@/components/dashboard/PreviewDashboard";
import { NotificationBellButton } from "@/components/ui/NotificationsPanel";

export function WebSearchActions({
  onOpenSearch,
  onOpenCoach,
  onOpenNotifications,
  unreadNotifications = 0,
}: {
  onOpenSearch?: () => void;
  onOpenCoach?: () => void;
  onOpenNotifications?: () => void;
  unreadNotifications?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-left transition hover:border-white/[0.12] hover:bg-zinc-900"
        aria-label="Search GoalOS"
      >
        <Search className="h-4 w-4 shrink-0 text-zinc-500" />
        <span className="hidden w-28 text-sm text-zinc-500 sm:inline lg:w-32">Search</span>
        <kbd className="hidden rounded border border-white/10 bg-zinc-950 px-1.5 py-0.5 text-[10px] text-zinc-500 lg:inline">
          ⌘K
        </kbd>
      </button>
      <NotificationBellButton unread={unreadNotifications} onClick={onOpenNotifications} />
      <button
        type="button"
        onClick={onOpenCoach}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900/60 text-zinc-300 transition hover:bg-zinc-800"
        aria-label="Open AI Coach"
      >
        <Sparkles className="h-4 w-4" />
      </button>
    </div>
  );
}

export function WebTopBar({
  displayName,
  onOpenSearch,
  onOpenCoach,
  onOpenNotifications,
  unreadNotifications,
  enterprise,
  orgName,
}: {
  displayName?: string;
  onOpenSearch?: () => void;
  onOpenCoach?: () => void;
  onOpenNotifications?: () => void;
  unreadNotifications?: number;
  enterprise?: boolean;
  orgName?: string;
}) {
  const name = displayName?.trim() || "there";

  return (
    <header className="mb-5 flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] pb-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
          {dashboardGreeting(name)}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {enterprise && orgName
            ? `${orgName} workspace · alignment overview`
            : "Your alignment overview for today."}
        </p>
      </div>
      <WebSearchActions
        onOpenSearch={onOpenSearch}
        onOpenCoach={onOpenCoach}
        onOpenNotifications={onOpenNotifications}
        unreadNotifications={unreadNotifications}
      />
    </header>
  );
}

export function WebPageHeader({
  title,
  onOpenSearch,
  onOpenCoach,
  onOpenNotifications,
  unreadNotifications,
}: {
  title: string;
  onOpenSearch?: () => void;
  onOpenCoach?: () => void;
  onOpenNotifications?: () => void;
  unreadNotifications?: number;
}) {
  return (
    <header className="mb-4 flex shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
      <h1 className="text-lg font-semibold text-zinc-50">{title}</h1>
      <WebSearchActions
        onOpenSearch={onOpenSearch}
        onOpenCoach={onOpenCoach}
        onOpenNotifications={onOpenNotifications}
        unreadNotifications={unreadNotifications}
      />
    </header>
  );
}
