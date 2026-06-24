"use client";

import { useGoalOS } from "@/hooks/useGoalOS";
import { OnboardingFlow } from "./onboarding/OnboardingFlow";
import { BottomNav } from "./layout/BottomNav";
import { WebSidebar } from "./layout/WebSidebar";
import { WebTopBar } from "./layout/WebTopBar";
import { MobileTopBar, MobileTabBar } from "./layout/MobileTopBar";
import { WebDashboard, MobileDashboard } from "./dashboard/PreviewDashboard";
import { GoalTab } from "./tabs/GoalTab";
import { CoachTab } from "./tabs/CoachTab";
import { InsightsTab } from "./tabs/InsightsTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { IntentGateModal } from "./focus/IntentGateModal";
import { FocusSprintModal } from "./focus/FocusSprintModal";
import { DemoModeBanner } from "./ui/DemoModeBanner";

export type GoalOSVariant = "web" | "mobile";

export function GoalOSApp({ variant = "mobile" }: { variant?: GoalOSVariant }) {
  const goalos = useGoalOS();
  const isWeb = variant === "web";

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

  const tabContent = (
    <>
      <DemoModeBanner state={goalos.state} />
      {goalos.activeTab === "today" &&
        (isWeb ? (
          <WebDashboard
            state={goalos.state}
            score={goalos.score!}
            coach={goalos.coach!}
            onStartSprint={() => goalos.openFocusSprint()}
            onOpenCoach={() => goalos.setActiveTab("coach")}
          />
        ) : (
          <MobileDashboard
            state={goalos.state}
            score={goalos.score!}
            coach={goalos.coach!}
            onStartSprint={() => goalos.openFocusSprint()}
            onViewAllApps={() => goalos.setActiveTab("goal")}
          />
        ))}
      {goalos.activeTab === "goal" && (
        <GoalTab
          state={goalos.state}
          onClassify={goalos.classifyApp}
          onLogUsage={goalos.logAppUsage}
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
          onStartSprint={() => goalos.openFocusSprint()}
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
      <>
        <WebSidebar
          active={goalos.activeTab}
          onChange={goalos.setActiveTab}
          displayName={goalos.state.displayName}
          streak={goalos.state.focusSprints.length > 0 ? goalos.state.focusSprints.length : 0}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-6 py-6 lg:px-8">
          {goalos.activeTab === "today" && (
            <WebTopBar displayName={goalos.state.displayName} />
          )}
          {goalos.activeTab !== "today" && goalos.activeTab !== "coach" && (
            <h1 className="mb-4 text-xl font-semibold capitalize text-zinc-50">
              {goalos.activeTab === "you" ? "Settings" : goalos.activeTab}
            </h1>
          )}
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {tabContent}
          </main>
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
