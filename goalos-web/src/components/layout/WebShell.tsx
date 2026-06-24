"use client";

import Link from "next/link";
import { TAGLINE } from "@/lib/constants";
import { Monitor, Smartphone } from "lucide-react";

export function WebShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="goalos-page-bg min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#2be7a8]/80">
              GoalOS AI · Web demo
            </p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-50 sm:text-3xl">
              <span className="goalos-gradient-text">{TAGLINE}</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-500">
              Full-width desktop experience — sidebar navigation, wider dashboards, and coach panel.
            </p>
          </div>
          <DemoSwitcher active="web" />
        </header>
        <div className="goalos-web-frame min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function DemoSwitcher({ active }: { active: "web" | "mobile" }) {
  return (
    <div className="goalos-card flex shrink-0 gap-1 p-1">
      <Link
        href="/web"
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
          active === "web"
            ? "bg-[#2be7a8]/15 text-[#2be7a8]"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <Monitor className="h-3.5 w-3.5" />
        Web
      </Link>
      <Link
        href="/mobile"
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
          active === "mobile"
            ? "bg-[#68a7ff]/15 text-[#68a7ff]"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <Smartphone className="h-3.5 w-3.5" />
        Mobile
      </Link>
    </div>
  );
}
