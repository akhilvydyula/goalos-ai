"use client";

import { useGoalOS } from "@/hooks/useGoalOS";
import { OnboardingFlow } from "./onboarding/OnboardingFlow";
import { BottomNav } from "./layout/BottomNav";
import { SidebarNav } from "./layout/SidebarNav";
import { DemoSwitcher } from "./layout/WebShell";
import { MobileHeader } from "./ui/GoalOSComponents";
import { TodayDashboard } from "./dashboard/TodayDashboard";
import { GoalTab } from "./tabs/GoalTab";
import { CoachTab } from "./tabs/CoachTab";
import { InsightsTab } from "./tabs/InsightsTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { IntentGateModal } from "./focus/IntentGateModal";
import { FocusSprintModal } from "./focus/FocusSprintModal";

export type GoalOSVariant = "web" | "mobile";

export function GoalOSApp({ variant = "mobile" }: { variant?: GoalOSVariant }) {
  const goalos = useGoalOS();
  const isWeb = variant === "web";

  if (!goalos.state) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2be7a8] border-t-transparent" />
      </div>
    );
  }

  if (!goalos.state.onboarded) {
    return <OnboardingFlow state={goalos.state} persist={goalos.persist} />;
  }

  const intentApp = goalos.intentAppId
    ? goalos.state.apps.find((a) => a.id === goalos.intentAppId)
    : null;

  const tabTitles: Record<string, { title: string; subtitle?: string }> = {
    today: { title: "Today", subtitle: goalos.state.goal?.title },
    goal: { title: "Your Goal", subtitle: "Apps & classification" },
    coach: { title: "Coach", subtitle: "AI productivity partner" },
    insights: { title: "Insights", subtitle: "Weekly patterns" },
    you: { title: "You", subtitle: stateProfile(goalos.state.profile?.identity) },
  };

  const header = tabTitles[goalos.activeTab] ?? { title: "GoalOS AI" };

  const tabContent = (
    <>
      {goalos.activeTab === "today" && (
        <TodayDashboard
          state={goalos.state}
          score={goalos.score!}
          coach={goalos.coach!}
          onStartSprint={() => goalos.setFocusSprintOpen(true)}
          onIntentGate={(appId) => goalos.setIntentAppId(appId)}
          layout={isWeb ? "web" : "mobile"}
        />
      )}
      {goalos.activeTab === "goal" && (
        <GoalTab
          state={goalos.state}
          onClassify={goalos.classifyApp}
          onIntentGate={(appId) => goalos.setIntentAppId(appId)}
        />
      )}
      {goalos.activeTab === "coach" && (
        <CoachTab
          state={goalos.state}
          coach={goalos.coach!}
          messages={goalos.coachMessages}
          thinking={goalos.coachThinking}
          webLLM={goalos.webLLM}
          onSend={(text) => void goalos.sendCoachMessage(text)}
          onAction={goalos.handleCoachAction}
          onRefresh={goalos.refreshCoachChat}
          onStartSprint={() => goalos.setFocusSprintOpen(true)}
          layout={isWeb ? "web" : "mobile"}
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
    return (
      <div className="flex h-full min-h-[calc(100dvh-10rem)] flex-col gap-4 lg:flex-row lg:gap-6">
        <SidebarNav active={goalos.activeTab} onChange={goalos.setActiveTab} />

        <div className="goalos-card flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {goalos.activeTab !== "coach" && (
            <MobileHeader
              eyebrow="GoalOS AI"
              title={header.title}
              subtitle={header.subtitle}
            />
          )}

          <main className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-6">
            {tabContent}
          </main>
        </div>

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
            onComplete={goalos.completeFocusSprint}
            onClose={() => goalos.setFocusSprintOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-dvh flex-col pb-[4.5rem]">
      <div className="flex justify-end px-3 pt-3 lg:hidden">
        <DemoSwitcher active="mobile" />
      </div>

      {goalos.activeTab !== "coach" && (
        <MobileHeader
          eyebrow="GoalOS AI"
          title={header.title}
          subtitle={header.subtitle}
        />
      )}

      <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {tabContent}
      </main>

      <BottomNav active={goalos.activeTab} onChange={goalos.setActiveTab} />

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
          onComplete={goalos.completeFocusSprint}
          onClose={() => goalos.setFocusSprintOpen(false)}
        />
      )}
    </div>
  );
}

function stateProfile(identity?: string) {
  return identity ? `Identity: ${identity}` : undefined;
}
