"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/ds";
import { EmptyReportsIllustration } from "@/components/ds/illustrations/EmptyReports";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { ValkSelect } from "@/components/ds";
import type { ValkSelectOption } from "@/components/ds";

type Report = {
  id: string;
  title: string;
  type: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  ai_generated: boolean | null;
  created_at: string;
  project: { name: string } | { name: string }[] | null;
  author: { name: string } | { name: string }[] | null;
};

type Project = { id: string; name: string };

const typeConfig: Record<string, { label: string; color: string }> = {
  sprint: { label: "Sprint", color: "#3B82F6" },
  monthly: { label: "Mensal", color: "#E24B4A" },
  experiment: { label: "Experimento", color: "#8B5CF6" },
  quarterly: { label: "Trimestral", color: "#F59E0B" },
  custom: { label: "Personalizado", color: "#888" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "#F59E0B" },
  published: { label: "Publicado", color: "#10B981" },
};

function resolve<T>(val: T | T[] | null): T | null {
  if (val == null) return null;
  if (Array.isArray(val)) return val[0] ?? null;
  return val;
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex shrink-0 rounded px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: `${color}10`,
        color,
        border: `1px solid ${color}20`,
      }}
    >
      {label}
    </span>
  );
}

function ReportCard({ report, index }: { report: Report; index: number }) {
  const typeCfg = typeConfig[report.type] ?? typeConfig.custom;
  const statusCfg = statusConfig[report.status] ?? statusConfig.draft;
  const project = resolve(report.project);
  const author = resolve(report.author);

  const periodStr =
    report.period_start && report.period_end
      ? `${format(new Date(report.period_start), "dd MMM", { locale: ptBR })} — ${format(new Date(report.period_end), "dd MMM yyyy", { locale: ptBR })}`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        href={`/reports/${report.id}`}
        className="group block rounded-xl border border-[#141414] bg-[#0A0A0A] p-5 transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-px hover:border-[#1F1F1F] hover:[box-shadow:0_8px_32px_rgba(0,0,0,0.4)]"
      >
        {/* Row 1: Type badge + Title */}
        <div className="flex items-center gap-2.5">
          <Badge label={typeCfg.label} color={typeCfg.color} />
          <h3 className="truncate font-display text-[15px] font-medium text-[#ddd] transition-colors duration-[250ms] group-hover:text-white">
            {report.title}
          </h3>
        </div>

        {/* Row 2: Product + Period + Status */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {project && (
            <span className="inline-flex rounded border border-[#1A1A1A] bg-[#0F0F0F] px-2 py-0.5 text-[10px] font-medium text-[#555]">
              {project.name}
            </span>
          )}
          {periodStr && (
            <span className="text-[12px] text-[#555]">{periodStr}</span>
          )}
          <Badge label={statusCfg.label} color={statusCfg.color} />
        </div>

        {/* Row 3: Author + Date + AI indicator */}
        <div className="mt-3 flex items-center gap-2 text-[11px]">
          {author && <span className="text-[#555]">{author.name}</span>}
          {author && <span className="text-[#333]">·</span>}
          <span className="text-[#444]">
            {format(new Date(report.created_at), "dd MMM yyyy", {
              locale: ptBR,
            })}
          </span>
          {report.ai_generated && (
            <>
              <span className="text-[#333]">·</span>
              <span className="text-[#E24B4A]">✦</span>
            </>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function ReportsEmptyState() {
  return (
    <EmptyState
      illustration={<EmptyReportsIllustration />}
      title="Nenhum relatório ainda"
      description="Relatórios de sprint, mensais e por produto são gerados com base nos seus dados."
    />
  );
}

const filterBtnClass = (active: boolean) =>
  `rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
    active
      ? "bg-white/[0.06] text-[#ccc]"
      : "text-[#444] hover:bg-white/[0.03] hover:text-[#888]"
  }`;

export function ReportsList({
  reports,
  projects,
}: {
  reports: Report[];
  projects: Project[];
}) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = reports.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (projectFilter !== "all") {
      const proj = resolve(r.project);
      const projMatch = projects.find((p) => p.id === projectFilter);
      if (!proj || !projMatch || proj.name !== projMatch.name) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Type filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTypeFilter("all")}
            className={filterBtnClass(typeFilter === "all")}
          >
            Todos
          </button>
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={filterBtnClass(typeFilter === key)}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-[#1A1A1A]" />

        {/* Product filter */}
        <ValkSelect
          value={projectFilter}
          onValueChange={setProjectFilter}
          placeholder="Todos os produtos"
          options={[
            { value: "all", label: "Todos os produtos" },
            ...projects.map((p) => ({ value: p.id, label: p.name })),
          ]}
          className="w-[180px]"
        />

        {/* Status filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStatusFilter("all")}
            className={filterBtnClass(statusFilter === "all")}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={filterBtnClass(statusFilter === "draft")}
          >
            Rascunho
          </button>
          <button
            onClick={() => setStatusFilter("published")}
            className={filterBtnClass(statusFilter === "published")}
          >
            Publicado
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-5">
        {filtered.length === 0 ? (
          <ReportsEmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filtered.map((report, i) => (
              <ReportCard key={report.id} report={report} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
