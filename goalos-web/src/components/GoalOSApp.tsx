"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGoalOS } from "@/hooks/useGoalOS";
import { useAuth } from "@/contexts/AuthContext";
import { isDemoSession } from "@/lib/api/demo-session";
import { OnboardingFlow } from "./onboarding/OnboardingFlow";
import { BottomNav } from "./layout/BottomNav";
import { WebSidebar } from "./layout/WebSidebar";
import { WebTopBar, WebPageHeader } from "./layout/WebTopBar";
import { MobileTopBar, MobileTabBar } from "./layout/MobileTopBar";
import { WebDashboard, MobileDashboard } from "./dashboard/PreviewDashboard";
import { GoalTab } from "./tabs/GoalTab";
import { CoachTab } from "./tabs/CoachTab";
import { InsightsTab } from "./tabs/InsightsTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { IntentGateModal } from "./focus/IntentGateModal";
import { FocusSprintModal } from "./focus/FocusSprintModal";
import { DemoModeBanner } from "./ui/DemoModeBanner";
import { GlobalSearch } from "./ui/GlobalSearch";
import { NotificationsPanel } from "./ui/NotificationsPanel";
import {
  buildNotifications,
  loadReadNotificationIds,
  saveReadNotificationIds,
  unreadCount,
  type AppNotification,
} from "@/lib/notifications";

const TAB_TITLES: Record<string, string> = {
  goal: "Goals",
  insights: "Insights",
  you: "Settings",
};

export type GoalOSVariant = "web" | "mobile";

export function GoalOSApp({
  variant = "mobile",
  enterprise = false,
}: {
  variant?: GoalOSVariant;
  enterprise?: boolean;
}) {
  const { session, logout, canAdmin } = useAuth();
  const router = useRouter();
  const isWeb = variant === "web";
  const apiToken =
    enterprise && session && !isDemoSession(session) ? session.accessToken : null;
  const goalos = useGoalOS({ apiToken });

  const handleSignOut = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKey, setSearchKey] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    void Promise.resolve().then(() => setReadNotificationIds(loadReadNotificationIds()));
  }, []);

  const {
    setActiveTab,
    openFocusSprint,
    setIntentAppId,
    sendCoachMessage,
    logAppUsage,
  } = goalos;

  const searchCallbacks = useMemo(
    () => ({
      navigate: setActiveTab,
      openFocusSprint: () => openFocusSprint(),
      openIntentGate: setIntentAppId,
      askCoach: (message: string) => void sendCoachMessage(message),
      logAppUsage,
    }),
    [setActiveTab, openFocusSprint, setIntentAppId, sendCoachMessage, logAppUsage]
  );

  const openSearch = useCallback(() => {
    setSearchKey((key) => key + 1);
    setSearchOpen(true);
  }, []);

  const notifications = useMemo(() => {
    if (!goalos.state?.onboarded || !goalos.coach || !goalos.score) return [];
    return buildNotifications(goalos.state, goalos.coach, goalos.score);
  }, [goalos.state, goalos.coach, goalos.score]);

  const notificationUnread = unreadCount(notifications, readNotificationIds);

  const markNotificationRead = useCallback((id: string) => {
    setReadNotificationIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadNotificationIds(next);
      return next;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    const next = new Set(notifications.map((n) => n.id));
    setReadNotificationIds(next);
    saveReadNotificationIds(next);
  }, [notifications]);

  const handleNotificationOpen = useCallback(
    (notification: AppNotification) => {
      markNotificationRead(notification.id);
      setNotificationsOpen(false);
      switch (notification.action.type) {
        case "navigate":
          goalos.setActiveTab(notification.action.tab);
          break;
        case "sprint":
          goalos.openFocusSprint();
          break;
        case "intent":
          goalos.setIntentAppId(notification.action.appId);
          break;
        case "coach":
          goalos.setActiveTab("coach");
          break;
      }
    },
    [markNotificationRead, goalos]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchKey((key) => key + 1);
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!enterprise || !session || !goalos.state || goalos.state.onboarded) return;
    goalos.persist({
      ...goalos.state,
      onboarded: true,
      displayName: session.user.displayName ?? session.user.email.split("@")[0],
      demoMode: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when enterprise session attaches
  }, [enterprise, session?.user.id, goalos.state?.onboarded]);

  if (!goalos.state) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2be7a8] border-t-transparent" />
      </div>
    );
  }

  if (!goalos.state.onboarded) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <OnboardingFlow state={goalos.state} persist={goalos.persist} />
      </div>
    );
  }

  const intentApp = goalos.intentAppId
    ? goalos.state.apps.find((a) => a.id === goalos.intentAppId)
    : null;

  const modals = (
    <>
      {goalos.coach && (
        <GlobalSearch
          key={searchKey}
          open={searchOpen}
          onOpenChange={setSearchOpen}
          state={goalos.state}
          coach={goalos.coach}
          callbacks={searchCallbacks}
        />
      )}
      <NotificationsPanel
        open={notificationsOpen}
        notifications={notifications}
        readIds={readNotificationIds}
        onClose={() => setNotificationsOpen(false)}
        onOpen={handleNotificationOpen}
        onMarkAllRead={markAllNotificationsRead}
      />
      {intentApp && (
        <IntentGateModal
          app={intentApp}
          onSelect={(reason, aligned) => goalos.recordIntent(intentApp.id, reason, aligned)}
          onClose={() => goalos.setIntentAppId(null)}
        />
      )}
      {goalos.focusSprintOpen && (
        <FocusSprintModal
          goal={goalos.state.goal}
          initialTitle={goalos.sprintPrefill?.title}
          initialDuration={goalos.sprintPrefill?.durationMinutes}
          onComplete={goalos.completeFocusSprint}
          onClose={goalos.closeFocusSprint}
        />
      )}
    </>
  );

  const displayName =
    enterprise && session
      ? session.user.displayName ?? session.user.email.split("@")[0]
      : goalos.state.displayName;

  const tabContent = (
    <>
      {!enterprise && <DemoModeBanner state={goalos.state} />}
      {goalos.activeTab === "today" &&
        (isWeb ? (
          <WebDashboard
            state={goalos.state}
            score={goalos.score!}
            coach={goalos.coach!}
            onStartSprint={() => goalos.openFocusSprint()}
            onOpenCoach={() => goalos.setActiveTab("coach")}
            onOpenGoal={() => goalos.setActiveTab("goal")}
          />
        ) : (
          <MobileDashboard
            state={goalos.state}
            score={goalos.score!}
            coach={goalos.coach!}
            onStartSprint={() => goalos.openFocusSprint()}
            onViewAllApps={() => goalos.setActiveTab("goal")}
            onIntentGate={(appId) => goalos.setIntentAppId(appId)}
            onLogUsage={goalos.logAppUsage}
          />
        ))}
      {goalos.activeTab === "goal" && (
        <GoalTab
          state={goalos.state}
          onClassify={goalos.classifyApp}
          onLogUsage={goalos.logAppUsage}
          onIntentGate={(appId) => goalos.setIntentAppId(appId)}
          onStartSprint={(title, minutes, problemId) =>
            goalos.openFocusSprint({ title, durationMinutes: minutes, dsaProblemId: problemId })
          }
        />
      )}
      {goalos.activeTab === "coach" && (
        <CoachTab
          state={goalos.state}
          score={goalos.score!.total}
          coach={goalos.coach!}
          messages={goalos.coachMessages}
          thinking={goalos.coachThinking}
          webLLM={goalos.webLLM}
          onSend={(text) => void goalos.sendCoachMessage(text)}
          onAction={goalos.handleCoachAction}
          onRefresh={goalos.refreshCoachChat}
        />
      )}
      {goalos.activeTab === "insights" && (
        <InsightsTab
          state={goalos.state}
          score={goalos.score!}
          weeklyReport={goalos.weeklyReport!}
          layout={isWeb ? "web" : "mobile"}
        />
      )}
      {goalos.activeTab === "you" && (
        <ProfileTab
          state={goalos.state}
          weeklyReport={goalos.weeklyReport!}
          onUpdate={goalos.update}
          onReset={() => {
            localStorage.removeItem("goalos-user-state");
            window.location.reload();
          }}
        />
      )}
    </>
  );

  if (isWeb) {
    const openCoach = () => goalos.setActiveTab("coach");
    const openNotifications = () => setNotificationsOpen(true);

    return (
      <>
        <WebSidebar
          active={goalos.activeTab}
          onChange={goalos.setActiveTab}
          displayName={displayName}
          focusSprints={goalos.state.focusSprints}
          focusSprintOpen={goalos.focusSprintOpen}
          enterprise={enterprise}
          orgName={session?.organization.name}
          plan={session?.organization.plan}
          canAdmin={canAdmin}
          onSignOut={enterprise ? handleSignOut : undefined}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-zinc-950/30">
          <div className="mx-auto flex h-full w-full max-w-6xl min-h-0 flex-col px-5 py-5 lg:px-8 lg:py-6">
          {goalos.activeTab === "today" ? (
            <WebTopBar
              displayName={displayName}
              onOpenSearch={openSearch}
              onOpenCoach={openCoach}
              onOpenNotifications={openNotifications}
              unreadNotifications={notificationUnread}
              enterprise={enterprise}
              orgName={session?.organization.name}
            />
          ) : goalos.activeTab === "coach" ? (
            <WebPageHeader
              title="AI Coach"
              onOpenSearch={openSearch}
              onOpenCoach={openCoach}
              onOpenNotifications={openNotifications}
              unreadNotifications={notificationUnread}
            />
          ) : (
            <WebPageHeader
              title={TAB_TITLES[goalos.activeTab] ?? goalos.activeTab}
              onOpenSearch={openSearch}
              onOpenCoach={openCoach}
              onOpenNotifications={openNotifications}
              unreadNotifications={notificationUnread}
            />
          )}
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {tabContent}
          </main>
          </div>
        </div>
        {modals}
      </>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#06070d]">
      <MobileTopBar
        displayName={goalos.state.displayName}
        demoMode={goalos.state.demoMode}
        onProfile={() => goalos.setActiveTab("you")}
        onOpenSearch={openSearch}
        onOpenNotifications={() => setNotificationsOpen(true)}
        unreadNotifications={notificationUnread}
      />
      <MobileTabBar active={goalos.activeTab} onChange={goalos.setActiveTab} />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {tabContent}
      </main>

      <BottomNav
        active={goalos.activeTab}
        onChange={goalos.setActiveTab}
        onFab={() => goalos.openFocusSprint()}
      />
      {modals}
    </div>
  );
}
