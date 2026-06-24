"use client";

import Link from "next/link";
import { Monitor, Smartphone } from "lucide-react";

export function WebShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="goalos-app-shell goalos-app-viewport">
      <div className="absolute right-4 top-4 z-30 hidden lg:block">
        <DemoSwitcher active="web" />
      </div>
      <div className="flex h-full min-h-0">{children}</div>
    </div>
  );
}

export function DemoSwitcher({ active }: { active: "web" | "mobile" }) {
  return (
    <div className="goalos-card flex shrink-0 gap-0.5 p-1">
      <Link
        href="/web"
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          active === "web"
            ? "bg-white/[0.08] text-zinc-100"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <Monitor className="h-3.5 w-3.5" />
        Web
      </Link>
      <Link
        href="/mobile"
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          active === "mobile"
            ? "bg-white/[0.08] text-zinc-100"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <Smartphone className="h-3.5 w-3.5" />
        Mobile
      </Link>
    </div>
  );
}
