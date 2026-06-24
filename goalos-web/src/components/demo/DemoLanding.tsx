"use client";

import Link from "next/link";
import Image from "next/image";
import { TAGLINE } from "@/lib/constants";
import { asset, MEDIA } from "@/lib/assets";
import { Monitor, Smartphone, ArrowRight, Code2, Target } from "lucide-react";
import { DemoReel } from "./DemoReel";
import { MediaGallery } from "./MediaGallery";

const demos = [
  {
    href: "/web",
    title: "Web demo",
    description:
      "Sidebar navigation, dashboards, and a full coach workspace — best on laptop.",
    icon: Monitor,
    badge: "Desktop",
    preview: MEDIA.webPreview,
  },
  {
    href: "/mobile",
    title: "Mobile demo",
    description:
      "Phone-frame UI with bottom tabs and touch-first flows — matches the Android app.",
    icon: Smartphone,
    badge: "Mobile",
    preview: MEDIA.mobilePreview,
  },
] as const;

export function DemoLanding() {
  return (
    <div className="goalos-page-bg flex min-h-dvh flex-col">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e]">
              <Target className="h-4 w-4 text-zinc-950" />
            </div>
            <span className="text-sm font-semibold text-zinc-100">GoalOS AI</span>
          </div>
          <a
            href="https://github.com/akhilvydyula/oss-goalos-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-300"
          >
            GitHub
          </a>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="goalos-eyebrow">Open-source productivity OS</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            {TAGLINE}
          </h1>
          <p className="mx-auto mt-4 text-base leading-relaxed text-zinc-400">
            Track screen time against your goals, get AI coaching, and build focus habits —
            private and local-first.
          </p>
        </div>

        <div className="mt-10">
          <DemoReel />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {demos.map(({ href, title, description, icon: Icon, badge, preview }) => (
            <Link
              key={href}
              href={href}
              className="goalos-card group flex flex-col overflow-hidden transition hover:border-white/[0.14]"
            >
              <div className="relative aspect-[16/10] bg-zinc-950">
                <Image
                  src={asset(preview)}
                  alt={`${title} preview`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
                <span className="absolute right-3 top-3 rounded-md border border-white/10 bg-zinc-950/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                  {badge}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">{description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#22c55e]">
                  Open demo
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <MediaGallery />

        <p className="mt-12 text-center text-xs text-zinc-600">
          Local-first · No API key · Optional browser AI
        </p>
        <a
          href="https://github.com/akhilvydyula/oss-goalos-ai"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mt-3 flex w-fit items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300"
        >
          <Code2 className="h-3.5 w-3.5" />
          View source
        </a>
      </div>
    </div>
  );
}
