"use client";

export type TriageTabValue = "all" | "scale" | "on_track" | "at_risk" | "kill";

interface TabProps {
  value: TriageTabValue;
  onChange: (v: TriageTabValue) => void;
  counts: Record<TriageTabValue, number>;
}

const TABS: { value: TriageTabValue; label: string; color?: string }[] = [
  { value: "all", label: "Todas" },
  { value: "scale", label: "Escalar", color: "#10B981" },
  { value: "on_track", label: "Manter", color: "#3B82F6" },
  { value: "at_risk", label: "Em risco", color: "#F59E0B" },
  { value: "kill", label: "Janela de kill", color: "#E24B4A" },
];

export function TriageFilterTabs({ value, onChange, counts }: TabProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-medium transition ${
              active
                ? "border-[#2A2A2A] bg-[#141414]"
                : "border-[#1F1F1F] bg-transparent hover:bg-[#0D0D0D]"
            }`}
          >
            {tab.color && (
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tab.color }} />
            )}
            <span className={active ? "text-white" : "text-[#888]"}>{tab.label}</span>
            <span className="font-mono text-[11px] text-[#555]">{counts[tab.value]}</span>
          </button>
        );
      })}
    </div>
  );
}
