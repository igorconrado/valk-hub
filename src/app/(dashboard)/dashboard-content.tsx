"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { formatBRL } from "@/lib/format";
import {
  ValkDialog,
  ValkNumberInput,
  Avatar as DsAvatar,
  PhaseBadge,
  HealthDot,
} from "@/components/ds";
import { RoleGate } from "@/components/role-gate";
import { ProjectLogo } from "@/components/project-logo";
import { getActionText } from "@/lib/activity-text";
import { saveCompanyMetrics } from "./dashboard-actions";
import type { Phase } from "@/components/ds";

import { FinancialHealthCard } from "@/components/dashboard/FinancialHealthCard";
import { TriageSummaryCard } from "@/components/dashboard/TriageSummaryCard";
import { MyPendingCard } from "@/components/dashboard/MyPendingCard";
import { UpcomingMeetingsCard } from "@/components/dashboard/UpcomingMeetingsCard";
import { RecentDecisionsCard } from "@/components/dashboard/RecentDecisionsCard";

type Project = {
  id: string;
  name: string;
  phase: string;
  status: string;
  logo_url: string | null;
  owner: { name: string } | null;
};

type Activity = {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, string> | null;
  created_at: string;
  user: { name: string } | null;
};

type MetricsSummary = {
  totalMrr: number;
  totalClients: number;
  prevMrr: number;
  prevClients: number;
  runwayMonths: number | null;
  cash: number | null;
  burnRate: number | null;
  hasMetrics: boolean;
};

type PendingItem = {
  id: string;
  kind: "task" | "action_item";
  title: string;
  due_date: string | null;
  priority?: string;
  href: string;
};

type DecisionItem = {
  id: string;
  description: string;
  impact_level: string | null;
  meeting_id: string | null;
};

type MeetingItem = {
  id: string;
  type: string;
  title: string | null;
  date: string;
};

type TriageSummary = {
  scaleCount: number;
  onTrackCount: number;
  atRiskCount: number;
  killCount: number;
  pendingDecisions: number;
};

const validPhases: Phase[] = ["discovery", "mvp", "validation", "traction", "scale", "paused"];

function makeAvatarUser(name: string) {
  return {
    name,
    initials: name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase(),
    color: "#555",
  };
}

/* ─── Metrics Edit Dialog ─── */
function MetricsEditDialog({
  metrics,
  open,
  onOpenChange,
}: {
  metrics: MetricsSummary;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [isSaving, startTransition] = useTransition();
  const [cash, setCash] = useState(metrics.cash ?? 0);
  const [burnRate, setBurnRate] = useState(metrics.burnRate ?? 0);
  const tFin = useTranslations("financial");
  const tc = useTranslations("common");

  const runway = burnRate > 0 ? cash / burnRate : null;
  const runwayLabel = runway !== null
    ? `${runway.toFixed(1).replace(".", ",")} ${tFin("months")}`
    : "—";

  function handleSave() {
    startTransition(async () => {
      const result = await saveCompanyMetrics(cash, burnRate);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Metricas salvas");
      onOpenChange(false);
    });
  }

  return (
    <ValkDialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={tFin("title")}
      subtitle={tFin("subtitle")}
      footer={
        <>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="rounded-lg px-4 py-2.5 text-[12px] text-[#555] transition-colors hover:text-[#888]"
          >
            {tc("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] disabled:opacity-70"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {tc("save")}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="label">{tFin("currentCash")}</label>
          <ValkNumberInput value={cash} onChange={setCash} prefix="R$" decimals={2} step={1000} min={0} placeholder="Ex: 500000,00" disabled={isSaving} />
        </div>
        <div>
          <label className="label">{tFin("monthlySpend")}</label>
          <ValkNumberInput value={burnRate} onChange={setBurnRate} prefix="R$" decimals={2} step={1000} min={0} placeholder="Ex: 35000,00" disabled={isSaving} />
        </div>
        <p className="text-[12px] text-[#555]">
          {tFin("runway")}: <span className="font-mono text-[#AAA]">{runwayLabel}</span>
        </p>
      </div>
    </ValkDialog>
  );
}

/* ─── Main Dashboard ─── */
export function DashboardContent({
  userName,
  projects,
  activities,
  metrics,
  pendingItems,
  pendingTotalCount,
  recentDecisions,
  upcomingMeetings,
  triageSummary,
}: {
  userName: string;
  projects: Project[];
  activities: Activity[];
  metrics: MetricsSummary;
  pendingItems: PendingItem[];
  pendingTotalCount: number;
  recentDecisions: DecisionItem[];
  upcomingMeetings: MeetingItem[];
  triageSummary: TriageSummary;
}) {
  const [dateStr, setDateStr] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const tDash = useTranslations("dashboard");

  useEffect(() => {
    setDateStr(format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR }));
  }, []);

  const mrrDelta = metrics.prevMrr > 0
    ? ((metrics.totalMrr - metrics.prevMrr) / metrics.prevMrr * 100)
    : 0;

  return (
    <div className="fadeUp space-y-6">
      {/* ═══ HERO: MRR ═══ */}
      <section className="py-4">
        <p
          className="font-mono"
          style={{
            fontSize: 11,
            color: "var(--text-faint)",
            margin: "0 0 10px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {dateStr || "\u00A0"}
        </p>
        <h1
          className="font-display"
          style={{
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
            fontFeatureSettings: '"tnum", "ss01"',
            margin: 0,
          }}
        >
          {formatBRL(metrics.totalMrr)}
        </h1>
        <div className="flex items-center" style={{ gap: 14, marginTop: 14 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {tDash("mrrConsolidated")}
          </span>
          {mrrDelta !== 0 && (
            <span className="mono" style={{ fontSize: 12, color: mrrDelta > 0 ? "var(--status-traction)" : "var(--status-scale)" }}>
              {mrrDelta > 0 ? "↑" : "↓"} {Math.abs(mrrDelta).toFixed(1)}%
            </span>
          )}
          {metrics.prevMrr > 0 && (
            <span style={{ fontSize: 11, color: "var(--text-ghost)" }}>vs. mes anterior</span>
          )}
          <RoleGate allowed={["admin"]}>
            <button
              onClick={() => setDialogOpen(true)}
              style={{ color: "var(--text-ghost)", transition: "color 150ms" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-ghost)")}
            >
              <Pencil size={14} strokeWidth={1.5} />
            </button>
          </RoleGate>
        </div>
      </section>

      {/* ═══ ROW 1: Financial Health + Triage ═══ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FinancialHealthCard
          currentCash={metrics.cash}
          monthlyBurn={metrics.burnRate}
          runwayMonths={metrics.runwayMonths}
        />
        <TriageSummaryCard {...triageSummary} />
      </div>

      {/* ═══ ROW 2: Pending + Upcoming Meetings ═══ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MyPendingCard items={pendingItems} totalCount={pendingTotalCount} />
        <UpcomingMeetingsCard meetings={upcomingMeetings} />
      </div>

      {/* ═══ ROW 3: Decisions ═══ */}
      <RecentDecisionsCard decisions={recentDecisions} />

      {/* ═══ ACTIVE PROJECTS ═══ */}
      <section>
        <div className="flex items-baseline justify-between" style={{ marginBottom: 18 }}>
          <div>
            <h2 className="display" style={{ fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
              Produtos ativos
            </h2>
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "4px 0 0" }}>
              {projects.length} produto{projects.length !== 1 ? "s" : ""} em andamento
            </p>
          </div>
        </div>

        <div
          className="grid gap-3.5"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="triage-card"
            >
              <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
                <ProjectLogo name={project.name} logoUrl={project.logo_url} size={24} fontSize={11} />
                <HealthDot state="good" />
                <span
                  className="display"
                  style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em", flex: 1 }}
                >
                  {project.name}
                </span>
                {validPhases.includes(project.phase as Phase) && (
                  <PhaseBadge phase={project.phase as Phase} />
                )}
              </div>
              {project.owner && (
                <div className="flex items-center" style={{ gap: 6 }}>
                  <DsAvatar user={makeAvatarUser(project.owner.name)} size={18} />
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                    {project.owner.name}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ ACTIVITY FEED ═══ */}
      <section>
        <div className="flex items-baseline justify-between" style={{ marginBottom: 14 }}>
          <h2 className="label">O que aconteceu</h2>
        </div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {activities.length === 0 ? (
            <p style={{ padding: "32px 20px", textAlign: "center", fontSize: 12, color: "var(--text-ghost)" }}>
              Nenhuma atividade ainda
            </p>
          ) : (
            activities.slice(0, 12).map((activity, i) => {
              const timeAgo = formatDistanceToNow(new Date(activity.created_at), {
                addSuffix: true,
                locale: ptBR,
              });
              return (
                <div
                  key={activity.id}
                  className="flex items-center"
                  style={{
                    padding: "13px 20px",
                    gap: 12,
                    borderBottom: i < Math.min(activities.length, 12) - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}
                >
                  {activity.user && (
                    <DsAvatar user={makeAvatarUser(activity.user.name)} size={22} />
                  )}
                  <div className="min-w-0 flex-1 truncate" style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                    {activity.user && (
                      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {activity.user.name}
                      </span>
                    )}{" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      {getActionText(activity.action, activity.metadata)}
                    </span>
                  </div>
                  <span suppressHydrationWarning className="mono" style={{ fontSize: 10, color: "var(--text-ghost)", flexShrink: 0 }}>
                    {timeAgo}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Metrics edit dialog */}
      <MetricsEditDialog metrics={metrics} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
