"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Plus, Trash2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  goalosApi,
  type ApiKeyRecord,
  type AuditLogEntry,
  type BillingStatus,
  type MemberRole,
  type OrgMember,
} from "@/lib/api/goalos-api";
import {
  demoApiKeys,
  demoAuditLogs,
  demoBilling,
  demoMembers,
  isDemoSession,
} from "@/lib/api/demo-session";

type AdminTab = "team" | "audit" | "api-keys" | "billing" | "compliance";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "team", label: "Team" },
  { id: "audit", label: "Audit log" },
  { id: "api-keys", label: "API keys" },
  { id: "billing", label: "Billing" },
  { id: "compliance", label: "Compliance" },
];

const roles: MemberRole[] = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminConsole() {
  const { session, canAdmin } = useAuth();
  const token = session?.accessToken ?? "";
  const [tab, setTab] = useState<AdminTab>("team");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [members, setMembers] = useState<OrgMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [billing, setBilling] = useState<BillingStatus | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("MEMBER");
  const [inviteResult, setInviteResult] = useState<string | null>(null);

  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const load = useCallback(
    async (targetTab?: AdminTab) => {
      if (!session) return;
      const activeTab = targetTab ?? tab;
      setLoading(true);
      setError(null);
      try {
        if (isDemoSession(session)) {
          if (activeTab === "team") setMembers(demoMembers);
          else if (activeTab === "audit") setAuditLogs(demoAuditLogs);
          else if (activeTab === "api-keys") setApiKeys(demoApiKeys);
          else if (activeTab === "billing") setBilling(demoBilling);
          return;
        }
        if (!token) return;
        if (activeTab === "team") {
          setMembers(await goalosApi.getMembers(token));
        } else if (activeTab === "audit") {
          setAuditLogs(await goalosApi.getAuditLogs(token));
        } else if (activeTab === "api-keys") {
          setApiKeys(await goalosApi.listApiKeys(token));
        } else if (activeTab === "billing") {
          setBilling(await goalosApi.getBillingStatus(token));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    },
    [token, tab, session]
  );

  const selectTab = useCallback(
    (next: AdminTab) => {
      setTab(next);
      void load(next);
    },
    [load]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial admin data fetch
    void load(tab);
  }, []);

  if (!canAdmin) {
    return (
      <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-sm text-rose-200">
        You need Owner or Admin role to access this console.
        <Link href="/app" className="ml-2 underline">
          Back to workspace
        </Link>
      </div>
    );
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteResult(null);
    setError(null);
    if (isDemoSession(session)) {
      setInviteResult("Invite sent (demo mode). Token: demo-invite-token-abc123");
      setInviteEmail("");
      return;
    }
    try {
      const res = await goalosApi.inviteMember(token, inviteEmail, inviteRole);
      setInviteResult(`Invite sent. Token: ${res.inviteToken}`);
      setInviteEmail("");
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    }
  }

  async function handleRoleChange(memberId: string, role: MemberRole) {
    try {
      await goalosApi.updateMemberRole(token, memberId, role);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Role update failed");
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Remove this member from the organization?")) return;
    try {
      await goalosApi.removeMember(token, memberId);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    }
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    setCreatedKey(null);
    if (isDemoSession(session)) {
      setCreatedKey(`gos_demo_${Date.now().toString(36)}`);
      setNewKeyName("");
      return;
    }
    try {
      const res = await goalosApi.createApiKey(token, newKeyName);
      setCreatedKey(res.apiKey);
      setNewKeyName("");
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create key failed");
    }
  }

  async function handleRevokeKey(keyId: string) {
    if (!confirm("Revoke this API key?")) return;
    try {
      await goalosApi.revokeApiKey(token, keyId);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revoke failed");
    }
  }

  async function handleCheckout(plan: "PRO" | "ENTERPRISE") {
    try {
      const res = await goalosApi.checkout(token, plan);
      setError(null);
      alert(`Plan updated to ${res.plan} (${res.seats} seats)`);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    }
  }

  async function handleExport() {
    if (isDemoSession(session)) {
      const blob = new Blob([JSON.stringify({ organization: session?.organization, demo: true }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "goalos-demo-export.json";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    try {
      const data = await goalosApi.exportData(token);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `goalos-export-${session?.organization.slug ?? "org"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  }

  async function handleDeletionRequest() {
    if (!confirm("Submit a data deletion request for this organization?")) return;
    try {
      const res = await goalosApi.requestDeletion(token);
      alert(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/app"
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Workspace
          </Link>
          <h1 className="text-xl font-semibold text-zinc-50">Admin console</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {session?.organization.name} · {session?.organization.plan} plan
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="goalos-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-white/[0.06] pb-px">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "border-b-2 border-[#22c55e] text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {tab === "team" && (
        <div className="space-y-6">
          <form onSubmit={(e) => void handleInvite(e)} className="goalos-card flex flex-wrap gap-3 p-4">
            <input
              type="email"
              required
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="min-w-[200px] flex-1 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-sm"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as MemberRole)}
              className="rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-sm"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button type="submit" className="goalos-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
              <Plus className="h-4 w-4" />
              Invite
            </button>
          </form>
          {inviteResult && (
            <p className="text-xs text-zinc-500">
              {inviteResult}
              <button
                type="button"
                className="ml-2 text-[#22c55e] hover:underline"
                onClick={() => void navigator.clipboard.writeText(inviteResult.split(": ")[1] ?? "")}
              >
                Copy token
              </button>
            </p>
          )}

          <div className="goalos-card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/[0.06] bg-zinc-900/50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-white/[0.04]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-200">
                        {m.user.displayName ?? m.user.email}
                      </p>
                      <p className="text-xs text-zinc-500">{m.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={m.role}
                        disabled={m.role === "OWNER"}
                        onChange={(e) => void handleRoleChange(m.id, e.target.value as MemberRole)}
                        className="rounded border border-white/[0.08] bg-zinc-900 px-2 py-1 text-xs"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{formatDate(m.joinedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {m.role !== "OWNER" && (
                        <button
                          type="button"
                          onClick={() => void handleRemoveMember(m.id)}
                          className="text-zinc-500 hover:text-rose-400"
                          aria-label="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {members.length === 0 && !loading && (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">No members loaded</p>
            )}
          </div>
        </div>
      )}

      {tab === "audit" && (
        <div className="goalos-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/[0.06] bg-zinc-900/50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Resource</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3 text-zinc-500">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {log.user?.displayName ?? log.user?.email ?? "System"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{log.action}</td>
                  <td className="px-4 py-3 text-zinc-500">{log.resource}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {auditLogs.length === 0 && !loading && (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">No audit events</p>
          )}
        </div>
      )}

      {tab === "api-keys" && (
        <div className="space-y-6">
          <form onSubmit={(e) => void handleCreateKey(e)} className="goalos-card flex gap-3 p-4">
            <input
              required
              placeholder="Key name (e.g. Production)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-sm"
            />
            <button type="submit" className="goalos-btn-primary px-4 py-2 text-sm">
              Create key
            </button>
          </form>
          {createdKey && (
            <div className="rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 px-4 py-3 text-sm">
              <p className="font-medium text-[#22c55e]">Copy your API key now — it won&apos;t be shown again.</p>
              <code className="mt-2 block break-all text-xs text-zinc-300">{createdKey}</code>
              <button
                type="button"
                onClick={() => void navigator.clipboard.writeText(createdKey)}
                className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
          )}
          <div className="goalos-card divide-y divide-white/[0.04]">
            {apiKeys.map((k) => (
              <div key={k.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-zinc-200">{k.name}</p>
                  <p className="text-xs text-zinc-500">
                    {k.keyPrefix}… · Created {formatDate(k.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRevokeKey(k.id)}
                  className="text-sm text-rose-400 hover:underline"
                >
                  Revoke
                </button>
              </div>
            ))}
            {apiKeys.length === 0 && !loading && (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">No API keys</p>
            )}
          </div>
        </div>
      )}

      {tab === "billing" && billing && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="goalos-card p-6">
            <h3 className="font-medium text-zinc-100">Current plan</h3>
            <p className="mt-2 text-3xl font-semibold text-zinc-50">{billing.plan}</p>
            <p className="mt-2 text-sm text-zinc-500">
              Seats: {billing.usage.seats} / {billing.limits.seats} · API keys:{" "}
              {billing.usage.apiKeys} / {billing.limits.apiKeys}
            </p>
            {billing.subscription && (
              <p className="mt-1 text-xs text-zinc-600">
                Subscription: {billing.subscription.status}
              </p>
            )}
          </div>
          <div className="goalos-card space-y-3 p-6">
            <h3 className="font-medium text-zinc-100">Upgrade</h3>
            <button
              type="button"
              onClick={() => void handleCheckout("PRO")}
              className="goalos-btn-secondary w-full py-2 text-sm"
            >
              Upgrade to Pro
            </button>
            <button
              type="button"
              onClick={() => void handleCheckout("ENTERPRISE")}
              className="goalos-btn-primary w-full py-2 text-sm"
            >
              Upgrade to Enterprise
            </button>
          </div>
        </div>
      )}

      {tab === "compliance" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="goalos-card p-6">
            <h3 className="font-medium text-zinc-100">GDPR data export</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Download a JSON export of organization data for compliance review.
            </p>
            <button
              type="button"
              onClick={() => void handleExport()}
              className="goalos-btn-secondary mt-4 px-4 py-2 text-sm"
            >
              Export data
            </button>
          </div>
          <div className="goalos-card border-rose-500/20 p-6">
            <h3 className="font-medium text-zinc-100">Deletion request</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Initiate organization data deletion per your data processing agreement.
            </p>
            <button
              type="button"
              onClick={() => void handleDeletionRequest()}
              className="mt-4 rounded-lg border border-rose-500/40 px-4 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
            >
              Request deletion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
