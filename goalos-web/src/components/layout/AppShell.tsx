import { TAGLINE } from "@/lib/constants";
import { Target, Sparkles, Shield, Zap } from "lucide-react";
import { DemoSwitcher } from "./WebShell";

const features = [
  {
    icon: Target,
    title: "Goal Alignment Score",
    body: "See if today's screen time moves you closer to your goal — not just how long you were on your phone.",
  },
  {
    icon: Sparkles,
    title: "AI Coach",
    body: "Context-aware coaching based on your Productivity DNA, usage patterns, and daily score.",
  },
  {
    icon: Shield,
    title: "Intent Gate",
    body: "Pause before distracting apps. Classify intent — learning or entertainment — and stay honest.",
  },
  {
    icon: Zap,
    title: "Focus Sprints",
    body: "Turn intention into execution with timed deep-work blocks that boost your score.",
  },
];

export function MobileDemoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="goalos-page-bg min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-7xl flex-col items-center gap-6 px-4 py-4 lg:flex-row lg:items-center lg:justify-center lg:gap-10 lg:px-8 lg:py-10">
        <aside className="hidden max-w-xs shrink-0 lg:block xl:max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#68a7ff]/80">
            Mobile demo
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-zinc-50 xl:text-4xl">
            <span className="goalos-gradient-text">{TAGLINE}</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            An AI productivity personality OS that turns unconscious screen time into intentional goal
            progress.
          </p>
          <p className="mt-3 text-sm text-zinc-500">
            Open source · Local-first demo · Android companion app available
          </p>
          <div className="mt-8 space-y-4">
            {features.slice(0, 2).map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[#2be7a8]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex w-full max-w-[430px] shrink-0 flex-col items-center gap-3">
          <div className="hidden w-full justify-end lg:flex">
            <DemoSwitcher active="mobile" />
          </div>
          <div className="goalos-phone-frame w-full">{children}</div>
        </div>

        <aside className="hidden max-w-xs shrink-0 lg:block xl:max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Core loop
          </p>
          <ol className="mt-4 space-y-3 text-sm text-zinc-400">
            <li className="flex gap-2">
              <span className="font-mono text-[#68a7ff]">01</span>
              Set your goal + Productivity DNA
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-[#68a7ff]">02</span>
              Track alignment score daily
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-[#68a7ff]">03</span>
              Coach → Intent Gate → Focus Sprint
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-[#68a7ff]">04</span>
              Weekly identity + momentum
            </li>
          </ol>
          <div className="mt-8 space-y-4">
            {features.slice(2).map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[#68a7ff]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

/** @deprecated Use MobileDemoShell */
export const AppShell = MobileDemoShell;
