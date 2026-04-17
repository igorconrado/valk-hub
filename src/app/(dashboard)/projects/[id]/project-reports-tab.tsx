"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart3, Plus } from "lucide-react";
import { RoleGate } from "@/components/role-gate";
import { GenerateReportDialog } from "@/app/(dashboard)/reports/generate-report-dialog";

type Report = {
  id: string;
  title: string;
  type: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  ai_generated: boolean | null;
  created_at: string;
  author: { name: string } | { name: string }[] | null;
};

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

export function ProjectReportsTab({
  projectId,
  reports,
}: {
  projectId: string;
  reports: Report[];
}) {
  return (
    <div className="py-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#555]">
          {reports.length} relatório{reports.length !== 1 ? "s" : ""}
        </span>
        <RoleGate allowed={["admin", "operator"]}>
          <GenerateReportDialog defaultProjectId={projectId}>
            <button className="flex items-center gap-1 rounded-lg border border-[#222] bg-transparent px-2.5 py-1 text-[11px] font-medium text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc]">
              <Plus size={12} strokeWidth={1.5} />
              Gerar relatório
            </button>
          </GenerateReportDialog>
        </RoleGate>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <BarChart3 size={28} strokeWidth={1.2} className="text-[#1A1A1A]" />
          <p className="mt-3 text-[13px] text-[#444]">
            Nenhum relatório pra esse produto.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {reports.map((r) => {
            const typeCfg = typeConfig[r.type] ?? typeConfig.custom;
            const statusCfg = statusConfig[r.status] ?? statusConfig.draft;
            const author = resolve(r.author);

            const periodStr =
              r.period_start && r.period_end
                ? `${format(new Date(r.period_start), "dd MMM", { locale: ptBR })} — ${format(new Date(r.period_end), "dd MMM", { locale: ptBR })}`
                : null;

            return (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="flex items-center gap-3 border-b border-[#0F0F0F] py-3.5 transition-colors last:border-0 hover:bg-white/[0.02]"
              >
                <Badge label={typeCfg.label} color={typeCfg.color} />
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#ddd]">
                  {r.title}
                </span>
                {periodStr && (
                  <span className="shrink-0 text-[11px] text-[#444]">
                    {periodStr}
                  </span>
                )}
                <Badge label={statusCfg.label} color={statusCfg.color} />
                {r.ai_generated && (
                  <span className="shrink-0 text-[#E24B4A]">✦</span>
                )}
                {author && (
                  <span className="shrink-0 text-[11px] text-[#444]">
                    {author.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
