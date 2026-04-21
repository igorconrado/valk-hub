"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { ProjectLogo } from "@/components/project-logo";
import { PhaseBadge, type Phase } from "@/components/ds";
import { formatBRL } from "@/lib/format";

export interface TriageProject {
  id: string;
  name: string;
  logo_url: string | null;
  phase: string;
  triage_status: string;
  triage_status_reason: string | null;
  owner: { name: string } | null;
  mrr: number;
  gate_label: string | null;
  gate_metric: string | null;
  gate_current: number | null;
  gate_target: number | null;
  decision_deadline: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; borderAccent?: string }> = {
  scale: { label: "↑ SCALE", color: "#10B981", borderAccent: "#10B98133" },
  on_track: { label: "→ ON TRACK", color: "#3B82F6" },
  at_risk: { label: "△ AT RISK", color: "#F59E0B", borderAccent: "#F59E0B33" },
  kill: { label: "✕ KILL", color: "#E24B4A", borderAccent: "#E24B4A33" },
  paused: { label: "● PAUSADO", color: "#888" },
  discovery: { label: "● DISCOVERY", color: "#3B82F6" },
  mvp: { label: "● MVP", color: "#F59E0B" },
};

const validPhases: Phase[] = ["discovery", "mvp", "validation", "traction", "scale", "paused"];

function formatGateValue(value: number, metric: string): string {
  if (metric.toUpperCase().includes("MRR") || metric.toUpperCase().includes("R$")) {
    return formatBRL(value, { compact: true });
  }
  if (metric.toLowerCase().includes("churn") || metric.includes("%")) {
    return `${value.toFixed(1)}%`;
  }
  return String(Math.round(value));
}

export function TriageProductCard({ project }: { project: TriageProject }) {
  const cfg = STATUS_CONFIG[project.triage_status] ?? STATUS_CONFIG.on_track;
  const hasGate = project.gate_metric && project.gate_current != null && project.gate_target != null;
  const progress = hasGate ? Math.min((project.gate_current! / project.gate_target!) * 100, 100) : 0;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block rounded-xl border bg-[#0A0A0A] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
      style={{
        borderColor: cfg.borderAccent ?? "#141414",
        boxShadow: cfg.borderAccent ? `0 0 0 1px ${cfg.borderAccent}` : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ProjectLogo name={project.name} logoUrl={project.logo_url} size={20} fontSize={9} />
          <span className="font-display text-[18px] font-semibold text-white">{project.name}</span>
          {validPhases.includes(project.phase as Phase) && (
            <PhaseBadge phase={project.phase as Phase} />
          )}
        </div>
        <span
          className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}25` }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Gate */}
      {project.gate_label && (
        <div className="mt-4 border-l-2 pl-3" style={{ borderColor: cfg.color }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#444]">GATE</p>
          <p className="mt-1 text-[13px] text-[#AAA]">{project.gate_label}</p>
        </div>
      )}

      {/* Metric + progress */}
      {hasGate && (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#444]">
            {project.gate_metric}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-[32px] font-bold leading-none" style={{ color: cfg.color }}>
              {formatGateValue(project.gate_current!, project.gate_metric!)}
            </span>
            <span className="text-[13px] text-[#555]">
              / {formatGateValue(project.gate_target!, project.gate_metric!)}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#1A1A1A]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: cfg.color }}
            />
          </div>
        </div>
      )}

      {/* Footer: owner + reason */}
      <div className="mt-4 flex items-start gap-2">
        {project.owner && (
          <span className="shrink-0 text-[11px] text-[#666]">{project.owner.name}</span>
        )}
        {project.triage_status_reason && (
          <p className="flex-1 text-right text-[12px] text-[#555] line-clamp-1">
            {project.triage_status_reason}
          </p>
        )}
      </div>

      {/* Deadline */}
      {project.decision_deadline && (
        <div
          className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-2"
          style={{ borderColor: cfg.borderAccent ?? "#141414" }}
        >
          <Clock size={12} style={{ color: cfg.color }} />
          <span suppressHydrationWarning className="font-mono text-[11px]" style={{ color: cfg.color }}>
            Decisao em {new Date(project.decision_deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" })}
          </span>
        </div>
      )}
    </Link>
  );
}
