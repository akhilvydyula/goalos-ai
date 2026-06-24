import { WebShell } from "@/components/layout/WebShell";
import { GoalOSApp } from "@/components/GoalOSApp";

export default function WebDemoPage() {
  return (
    <WebShell>
      <GoalOSApp variant="web" />
    </WebShell>
  );
}
