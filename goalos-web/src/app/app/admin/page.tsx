import { EnterpriseShell } from "@/components/layout/EnterpriseShell";
import { AuthGate } from "@/components/enterprise/AuthGate";
import { AdminConsole } from "@/components/enterprise/AdminConsole";

export default function AdminPage() {
  return (
    <AuthGate>
      <EnterpriseShell>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-zinc-950/30">
          <div className="mx-auto flex h-full w-full max-w-5xl min-h-0 flex-col overflow-y-auto px-5 py-6 lg:px-8">
            <AdminConsole />
          </div>
        </div>
      </EnterpriseShell>
    </AuthGate>
  );
}
