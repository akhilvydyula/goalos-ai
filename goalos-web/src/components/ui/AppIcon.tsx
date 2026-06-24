const APP_STYLES: Record<string, { bg: string; text: string; abbr: string }> = {
  Udemy: { bg: "from-violet-500/30 to-violet-600/20", text: "text-violet-300", abbr: "Ud" },
  ChatGPT: { bg: "from-emerald-500/30 to-teal-600/20", text: "text-emerald-300", abbr: "AI" },
  YouTube: { bg: "from-red-500/30 to-rose-600/20", text: "text-red-300", abbr: "YT" },
  Instagram: { bg: "from-pink-500/30 to-fuchsia-600/20", text: "text-pink-300", abbr: "Ig" },
  LinkedIn: { bg: "from-sky-500/30 to-blue-600/20", text: "text-sky-300", abbr: "In" },
  LeetCode: { bg: "from-amber-500/30 to-orange-600/20", text: "text-amber-300", abbr: "LC" },
  Notion: { bg: "from-zinc-400/25 to-zinc-500/15", text: "text-zinc-200", abbr: "No" },
  Chrome: { bg: "from-blue-500/25 to-cyan-500/15", text: "text-blue-300", abbr: "Ch" },
  WhatsApp: { bg: "from-green-500/30 to-emerald-600/20", text: "text-green-300", abbr: "Wa" },
  TikTok: { bg: "from-fuchsia-500/30 to-pink-600/20", text: "text-fuchsia-300", abbr: "Tk" },
};

const DEFAULT_STYLE = {
  bg: "from-[#2be7a8]/20 to-[#68a7ff]/15",
  text: "text-[#2be7a8]",
  abbr: "Go",
};

export function appIconStyle(name: string) {
  return APP_STYLES[name] ?? {
    ...DEFAULT_STYLE,
    abbr: name.slice(0, 2),
  };
}

export function AppIcon({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const style = appIconStyle(name);
  const dim =
    size === "sm" ? "h-8 w-8 text-[10px]" : size === "lg" ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg bg-zinc-800 font-semibold text-zinc-300 ring-1 ring-white/[0.06] ${dim}`}
    >
      {style.abbr}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="goalos-eyebrow">{children}</p>;
}

export function ScoreLabel({ score }: { score: number }) {
  const label =
    score >= 85 ? "Excellent" : score >= 75 ? "Strong" : score >= 60 ? "On track" : "Needs focus";
  const color =
    score >= 85
      ? "text-[#2be7a8]"
      : score >= 75
        ? "text-[#68a7ff]"
        : score >= 60
          ? "text-amber-300"
          : "text-rose-300";

  return <span className={`text-xs font-semibold ${color}`}>{label}</span>;
}
