"use client";

import { Download, Users } from "lucide-react";
import { formatBRL } from "@/lib/format";

export interface TriageSummary {
  total_projects: number;
  scale_count: number;
  on_track_count: number;
  at_risk_count: number;
  kill_count: number;
  paused_count: number;
  mrr_scaling: number;
  mrr_at_risk: number;
  kill_rate_pct: number;
  pending_decisions: number;
}

function AggregateMetric({
  label,
  value,
  subtitle,
  color,
}: {
  label: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[#141414] bg-[#0A0A0A] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#444]">{label}</p>
      <p className="mt-3 font-display text-[32px] font-bold leading-none" style={{ color }}>
        {value}
      </p>
      <p className="mt-2 text-[12px] text-[#666]">{subtitle}</p>
    </div>
  );
}

export function TriageHero({
  summary,
  onOpenCommittee,
}: {
  summary: TriageSummary;
  onOpenCommittee: () => void;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#E24B4A]" />
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#E24B4A]">
          Triage · Semanal
        </span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-8">
        <div className="min-w-[300px] max-w-[640px] flex-1">
          <h1 className="font-display text-[52px] font-bold leading-[1.05] text-white">
            Aquela que escolhe.
          </h1>
          <p className="mt-3 max-w-[520px] text-[14px] text-[#888]">
            Cada produto do portfolio contra seu traction gate. O que passou, escala. O que nao
            passou na janela, mata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              /* toast placeholder */
              import("sonner").then(({ toast }) => toast.info("Exportar: em breve"));
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1F1F1F] bg-transparent px-4 py-2 text-[13px] text-[#AAA] transition hover:bg-[#0D0D0D]"
          >
            <Download size={14} /> Exportar
          </button>
          <button
            onClick={onOpenCommittee}
            className="inline-flex items-center gap-2 rounded-lg bg-[#E24B4A] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#D43C3B]"
          >
            <Users size={14} /> Abrir comite
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <AggregateMetric
          label="MRR Escalando"
          value={formatBRL(summary.mrr_scaling, { compact: true })}
          subtitle={`${summary.scale_count} produto(s)`}
          color="#10B981"
        />
        <AggregateMetric
          label="MRR em Risco"
          value={formatBRL(summary.mrr_at_risk, { compact: true })}
          subtitle={`${summary.at_risk_count} produto(s)`}
          color="#E24B4A"
        />
        <AggregateMetric
          label="Decisoes na Semana"
          value={String(summary.pending_decisions)}
          subtitle="deadline ≤ 3 dias"
          color="#F59E0B"
        />
        <AggregateMetric
          label="Taxa de Kill"
          value={`${Math.round(summary.kill_rate_pct)}%`}
          subtitle={`${summary.kill_count} de ${summary.total_projects} produtos`}
          color="#888"
        />
      </div>
    </section>
  );
}
