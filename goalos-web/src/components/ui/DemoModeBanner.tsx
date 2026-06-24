import { Info, FlaskConical } from "lucide-react";
import type { UserState } from "@/lib/types";
import { totalScreenMinutes } from "@/lib/demo-data";

export function DemoModeBanner({ state }: { state: UserState }) {
  if (state.demoMode) {
    return (
      <div className="mb-4 flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <div className="text-xs leading-relaxed text-amber-100/90">
          <p className="font-semibold text-amber-200">Sample data mode</p>
          <p className="mt-0.5 text-amber-100/80">
            You loaded the instant demo. Usage numbers are illustrative, not read from your device.
          </p>
        </div>
      </div>
    );
  }

  const hasUsage = totalScreenMinutes(state.apps) > 0 || state.focusSprints.length > 0;

  return (
    <div className="mb-4 flex gap-3 rounded-xl border border-[#68a7ff]/20 bg-[#68a7ff]/5 px-4 py-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#68a7ff]" />
      <div className="text-xs leading-relaxed text-zinc-400">
        <p className="font-semibold text-zinc-200">Web demo — manual tracking</p>
        <p className="mt-0.5">
          {hasUsage
            ? "Your score updates from logged app time, focus sprints, and intent check-ins. Coach uses rules; optional browser AI in the Coach tab."
            : "Log app time on the Goals tab or complete a focus sprint to build your score. No ML predictions — everything is calculated from your actions."}
        </p>
      </div>
    </div>
  );
}
