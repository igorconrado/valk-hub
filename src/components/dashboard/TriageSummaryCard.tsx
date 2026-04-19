"use client";

import { DashboardCard } from "./DashboardCard";

interface TriageSummaryProps {
  scaleCount: number;
  onTrackCount: number;
  atRiskCount: number;
  killCount: number;
  pendingDecisions: number;
}

function Stat({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[12px] text-[#888]">{label}</span>
      <span className="ml-auto font-mono text-[14px] font-semibold text-[#DDD]">{count}</span>
    </div>
  );
}

export function TriageSummaryCard(props: TriageSummaryProps) {
  return (
    <DashboardCard title="Triagem da semana">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Escalar" count={props.scaleCount} color="#10B981" />
        <Stat label="Em risco" count={props.atRiskCount} color="#F59E0B" />
        <Stat label="On track" count={props.onTrackCount} color="#3B82F6" />
        <Stat label="Janela de kill" count={props.killCount} color="#E24B4A" />
      </div>

      {props.pendingDecisions > 0 && (
        <div className="mt-4 rounded-lg border border-[#E24B4A33] bg-[rgba(226,75,74,0.05)] px-3 py-2">
          <span className="font-mono text-[11px] text-[#E24B4A]">
            {props.pendingDecisions}{" "}
            {props.pendingDecisions === 1 ? "decisao pendente" : "decisoes pendentes"} · proximos 7
            dias
          </span>
        </div>
      )}
    </DashboardCard>
  );
}
