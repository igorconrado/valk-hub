"use client";

import type { ReactNode } from "react";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
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
  committeeAction,
}: {
  summary: TriageSummary;
  committeeAction: ReactNode;
}) {
  const t = useTranslations("triage");

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#E24B4A]" />
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#E24B4A]">
          {t("tagHeader")}
        </span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-8">
        <div className="min-w-[300px] max-w-[640px] flex-1">
          <h1 className="font-display text-[42px] font-bold leading-[1.1] text-white">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-[520px] text-[14px] text-[#888]">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              import("sonner").then(({ toast }) => toast.info("Exportar: em breve"));
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1F1F1F] bg-transparent px-4 py-2 text-[13px] text-[#AAA] transition hover:bg-[#0D0D0D]"
          >
            <Download size={14} /> {t("export")}
          </button>
          {committeeAction}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <AggregateMetric
          label={t("metrics.mrrScaling")}
          value={formatBRL(summary.mrr_scaling, { compact: true })}
          subtitle={`${summary.scale_count} produto${summary.scale_count !== 1 ? "s" : ""}`}
          color="#10B981"
        />
        <AggregateMetric
          label={t("metrics.mrrAtRisk")}
          value={formatBRL(summary.mrr_at_risk, { compact: true })}
          subtitle={`${summary.at_risk_count} produto${summary.at_risk_count !== 1 ? "s" : ""}`}
          color="#E24B4A"
        />
        <AggregateMetric
          label={t("metrics.weekDecisions")}
          value={String(summary.pending_decisions)}
          subtitle={t("metrics.decisionsDeadline")}
          color="#F59E0B"
        />
        <AggregateMetric
          label={t("metrics.killRate")}
          value={`${Math.round(summary.kill_rate_pct)}%`}
          subtitle={`${summary.kill_count} de ${summary.total_projects} produtos`}
          color="#888"
        />
      </div>
    </section>
  );
}
