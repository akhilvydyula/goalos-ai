"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Target, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_ACCOUNTS } from "@/lib/demo-credentials";

export function LoginPage() {
  const { login, session, apiEnabled } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (session) router.replace("/app");
  }, [session, router]);

  if (session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#22c55e] border-t-transparent" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setPending(false);
    }
  }

  function signInAsDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
    setPending(true);
    void login(account.email, account.password)
      .then(() => router.push("/app"))
      .catch((err) => setError(err instanceof Error ? err.message : "Sign in failed"))
      .finally(() => setPending(false));
  }

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950">
      <header className="border-b border-white/[0.06] px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e]">
            <Target className="h-5 w-5 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Sign in to GoalOS</h1>
            <p className="text-sm text-zinc-500">Enterprise workspace</p>
          </div>
        </div>

        {!apiEnabled && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            API offline — demo sign-in still works below. For live backend, set{" "}
            <code className="text-xs">NEXT_PUBLIC_API_URL=http://localhost:4000</code> and run{" "}
            <code className="text-xs">npm run saas:dev</code>.
          </div>
        )}

        <div className="mb-6 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Demo accounts</p>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              type="button"
              disabled={pending}
              onClick={() => signInAsDemo(account)}
              className="goalos-card flex w-full items-center justify-between px-4 py-3 text-left transition hover:border-white/[0.12] disabled:opacity-60"
            >
              <div>
                <p className="text-sm font-medium text-zinc-200">{account.label}</p>
                <p className="text-xs text-zinc-500">{account.email}</p>
              </div>
              <span className="text-xs text-zinc-600">Demo1234!</span>
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950 px-2 text-zinc-600">or sign in manually</span>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#22c55e]/50"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#22c55e]/50"
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="goalos-btn-primary w-full py-2.5 text-sm disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          No account?{" "}
          <Link href="/register" className="font-medium text-[#22c55e] hover:underline">
            Create organization
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-zinc-600">
          <Link href="/web" className="hover:text-zinc-400">
            Try sandbox demo without an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register, session, apiEnabled } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    orgName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (session) router.replace("/app");
  }, [session, router]);

  if (session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#22c55e] border-t-transparent" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (!apiEnabled) {
        throw new Error("Platform API offline. Configure NEXT_PUBLIC_API_URL and start SaaS services.");
      }
      await register({
        email: form.email,
        password: form.password,
        displayName: form.displayName || undefined,
        orgName: form.orgName || undefined,
      });
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950">
      <header className="border-b border-white/[0.06] px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <h1 className="text-xl font-semibold text-zinc-50">Create your organization</h1>
        <p className="mt-2 text-sm text-zinc-500">
          14-day enterprise trial · RBAC · audit logs · API access
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
          {(
            [
              ["orgName", "Organization name", "text", "Acme Labs"],
              ["displayName", "Your name", "text", "Alex Founder"],
              ["email", "Work email", "email", "you@company.com"],
              ["password", "Password (min 8 chars)", "password", ""],
            ] as const
          ).map(([key, label, type, placeholder]) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</label>
              <input
                type={type}
                required={key === "email" || key === "password"}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#22c55e]/50"
              />
            </div>
          ))}
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={pending || !apiEnabled}
            className="goalos-btn-primary w-full py-2.5 text-sm disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create organization"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#22c55e] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
