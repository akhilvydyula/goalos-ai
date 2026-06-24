import { EnterpriseShell } from "@/components/layout/EnterpriseShell";
import { AuthGate } from "@/components/enterprise/AuthGate";
import { GoalOSApp } from "@/components/GoalOSApp";

export default function AppWorkspacePage() {
  return (
    <AuthGate>
      <EnterpriseShell>
        <GoalOSApp variant="web" enterprise />
      </EnterpriseShell>
    </AuthGate>
  );
}
