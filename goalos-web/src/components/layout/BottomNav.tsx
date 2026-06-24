import type { TabId } from "@/lib/types";
import { Home, Target, Zap, BarChart3, Plus } from "lucide-react";

const left: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "today", label: "Home", icon: Home },
  { id: "goal", label: "Goals", icon: Target },
];

const right: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "coach", label: "Coach", icon: Zap },
  { id: "insights", label: "Insights", icon: BarChart3 },
];

export function BottomNav({
  active,
  onChange,
  onFab,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
  onFab: () => void;
}) {
  return (
    <nav className="goalos-nav-glass relative z-20 shrink-0 px-2 pb-2 pt-1">
      <div className="flex items-end justify-between">
        <div className="flex flex-1 justify-around">
          {left.map(({ id, label, icon: Icon }) => (
            <NavBtn key={id} id={id} label={label} icon={Icon} active={active} onChange={onChange} />
          ))}
        </div>

        <button
          type="button"
          onClick={onFab}
          className="-mt-6 mx-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-zinc-950 shadow-md"
          aria-label="Start focus sprint"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>

        <div className="flex flex-1 justify-around">
          {right.map(({ id, label, icon: Icon }) => (
            <NavBtn key={id} id={id} label={label} icon={Icon} active={active} onChange={onChange} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavBtn({
  id,
  label,
  icon: Icon,
  active,
  onChange,
}: {
  id: TabId;
  label: string;
  icon: typeof Home;
  active: TabId;
  onChange: (tab: TabId) => void;
}) {
  const isActive = active === id;
  return (
    <button
      type="button"
      onClick={() => onChange(id)}
      className={`flex flex-col items-center gap-0.5 px-2 py-2 transition-colors ${
        isActive ? "text-[#22c55e]" : "text-zinc-500"
      }`}
    >
      <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
