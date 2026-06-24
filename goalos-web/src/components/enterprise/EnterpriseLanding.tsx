"use client";

import Link from "next/link";
import {
  Target,
  Shield,
  Users,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Code2,
  Zap,
  Brain,
} from "lucide-react";
import { goalosApi } from "@/lib/api/goalos-api";
import { TAGLINE, SUBTAGLINE, PRODUCT_PROMISE } from "@/lib/constants";

const productLoop = [
  "Goal Setup",
  "Productivity DNA",
  "Usage Tracking",
  "Intent Gate",
  "Alignment Score",
  "AI Coach",
  "Focus Sprint",
  "Weekly Identity",
];

const p0Features = [
  {
    icon: Brain,
    title: "Goal Alignment Score",
    body: "Explainable daily score — what helped, what hurt, and how to reach 80+.",
  },
  {
    icon: Sparkles,
    title: "AI next best action",
    body: "One diagnosis, one action, one reminder. Supportive coach tone — never shame.",
  },
  {
    icon: Zap,
    title: "Focus engine",
    body: "Intent Gate before distractions, Focus Sprints with score boost, smart reminders.",
  },
  {
    icon: BarChart3,
    title: "Weekly identity",
    body: "Share-worthy identity cards — Consistent Builder, Deep Worker, and more.",
  },
  {
    icon: Shield,
    title: "Privacy-first",
    body: "Usage patterns only. No messages, photos, or private content. Open source.",
  },
  {
    icon: Users,
    title: "Enterprise ready",
    body: "Multi-tenant workspaces, RBAC, audit logs, API keys — Atopush-scale platform.",
  },
];

export function EnterpriseLanding() {
  const apiLive = goalosApi.enabled();

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e]">
              <Target className="h-4 w-4 text-zinc-950" />
            </div>
            <span className="font-semibold">GoalOS AI</span>
            <span className="rounded-md border border-white/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              Open Source
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/web" className="hidden text-sm text-zinc-500 hover:text-zinc-300 sm:inline">
              Try product
            </Link>
            <a
              href="https://github.com/akhilvydyula/oss-goalos-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 sm:flex"
            >
              <Code2 className="h-4 w-4" />
              GitHub
            </a>
            <Link href="/login" className="goalos-btn-secondary px-4 py-2 text-sm">
              Sign in
            </Link>
            <Link href="/register" className="goalos-btn-primary px-4 py-2 text-sm">
              Start free
            </Link>
          </nav>
        </div>
      </header>

      <section className="goalos-page-bg relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(34,197,94,0.12),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="text-sm font-medium text-[#22c55e]">{TAGLINE}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
            The AI productivity OS that turns screen time into goal time.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            {SUBTAGLINE} {PRODUCT_PROMISE}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/web" className="goalos-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
              Open product
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="goalos-btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm">
              Enterprise sign in
            </Link>
          </div>
          <p className="mt-4 text-xs text-zinc-600">
            {apiLive ? "Platform API connected" : "Demo: admin@demo.goalos / Demo1234!"}
          </p>
        </div>
      </section>

      <section className="border-t border-white/[0.06] bg-zinc-900/20 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="goalos-eyebrow">Core product loop</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {productLoop.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-white/[0.08] bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
                  {step}
                </span>
                {i < productLoop.length - 1 && (
                  <span className="text-zinc-700">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06]">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
          {p0Features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="goalos-card p-6">
              <Icon className="h-5 w-5 text-[#22c55e]" />
              <h3 className="mt-4 font-medium text-zinc-100">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/[0.06] bg-zinc-900/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-xl font-semibold">Built for scale</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Microservices architecture, Postgres, Docker — open source on GitHub.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "JWT auth + demo credentials",
              "Goal Alignment Score v1 (Notion spec weights)",
              "Browser WebLLM coach (optional)",
              "Admin console: team, audit, billing",
              "Android client + web dashboard",
              "Privacy-safe usage analytics",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-zinc-400">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22c55e]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-6 py-8 text-center text-xs text-zinc-600">
        <a
          href="https://app.notion.com/p/GoalOS-AI-World-Class-Product-Documentation-Hub-387f3d17ece781ff90b1cfbd7439675f"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-400"
        >
          Product documentation
        </a>
        {" · "}
        <Link href="/web" className="hover:text-zinc-400">
          Sandbox
        </Link>
        {" · "}
        <a
          href="https://github.com/akhilvydyula/oss-goalos-ai"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-400"
        >
          oss-goalos-ai on GitHub
        </a>
      </footer>
    </div>
  );
}
