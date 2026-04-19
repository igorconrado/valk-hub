"use client";

import Link from "next/link";
import { DashboardCard } from "./DashboardCard";

interface DecisionItem {
  id: string;
  description: string;
  impact_level: string | null;
  meeting_id: string | null;
}

const IMPACT_COLOR: Record<string, string> = {
  low: "#666",
  medium: "#3B82F6",
  high: "#F59E0B",
  critical: "#E24B4A",
};

export function RecentDecisionsCard({ decisions }: { decisions: DecisionItem[] }) {
  if (decisions.length === 0) {
    return (
      <DashboardCard title="Decisoes recentes">
        <p className="py-6 text-center text-[13px] text-[#666]">
          Nenhuma decisao registrada ainda.
        </p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Decisoes recentes" action={{ label: "Ver historico", href: "/meetings" }}>
      <ul className="space-y-2.5">
        {decisions.map((d) => (
          <li key={d.id}>
            <Link
              href={d.meeting_id ? `/meetings/${d.meeting_id}` : "/meetings"}
              className="-mx-2 flex items-start gap-2 rounded-lg px-2 py-1.5 transition hover:bg-[#0D0D0D]"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: IMPACT_COLOR[d.impact_level ?? ""] ?? "#666" }}
              />
              <span className="line-clamp-1 text-[13px] text-[#DDD]">{d.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
