import { MobileDemoShell } from "@/components/layout/AppShell";
import { GoalOSApp } from "@/components/GoalOSApp";

export default function MobileDemoPage() {
  return (
    <MobileDemoShell>
      <GoalOSApp variant="mobile" />
    </MobileDemoShell>
  );
}
