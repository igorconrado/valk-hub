"use client";

import { useState, useEffect, useTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { format, formatDistanceToNow, isPast, parseISO, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Loader2,
  Pencil,
  Circle,
} from "lucide-react";
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
import { completePendingItem, saveCompanyMetrics } from "./dashboard-actions";
import type { Phase } from "@/components/ds";

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

type PendingItem = {
  id: string;
  title: string;
  due_date: string | null;
  source: "task" | "action_item";
  meeting_id: string | null;
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

type RecentDecision = {
  id: string;
  title: string;
  meeting_id: string | null;
  date: string;
};

const validPhases: Phase[] = ["discovery", "mvp", "validation", "traction", "scale", "paused"];

function getFirstName(name: string): string {
  return name.split(" ")[0];
}

function makeAvatarUser(name: string) {
  return {
    name,
    initials: name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase(),
    color: "#555",
  };
}

/* ─── Pending Item Row (handoff style) ─── */
function PendingItemRow({ item }: { item: PendingItem }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const dueLabel = (() => {
    if (!item.due_date) return "sem prazo";
    const d = parseISO(item.due_date);
    if (isToday(d)) return "hoje";
    if (isPast(d)) return format(d, "dd MMM", { locale: ptBR });
    // Tomorrow check
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return "amanhã";
    return format(d, "dd MMM", { locale: ptBR });
  })();

  const isOverdue = item.due_date && isPast(parseISO(item.due_date)) && !isToday(parseISO(item.due_date));

  function handleComplete() {
    startTransition(async () => {
      const result = await completePendingItem(item.id, item.source);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setDone(true);
    });
  }

  if (done) return null;

  return (
    <li className="flex items-center" style={{ gap: 10, padding: "6px 0" }}>
      <button
        onClick={handleComplete}
        disabled={isPending}
        style={{
          width: 14,
          height: 14,
          border: "1.5px solid var(--border-default)",
          borderRadius: 4,
          flexShrink: 0,
          transition: "all 150ms",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
      >
        {isPending && <Loader2 size={8} className="animate-spin" style={{ color: "var(--text-muted)" }} />}
      </button>
      <span
        style={{
          fontSize: 13,
          color: "var(--text-primary)",
          flex: 1,
          lineHeight: 1.4,
        }}
      >
        {item.title}
      </span>
      <span
        className="mono"
        style={{
          fontSize: 10,
          color: dueLabel === "hoje" || isOverdue ? "var(--primary)" : "var(--text-ghost)",
        }}
      >
        {dueLabel}
      </span>
    </li>
  );
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

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const result = await saveCompanyMetrics(cash, burnRate);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Métricas salvas");
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
          <button type="button" onClick={() => onOpenChange(false)} disabled={isSaving} className="btn subtle" style={{ fontSize: 12 }}>{tc("cancel")}</button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              const form = document.getElementById("metrics-edit-form") as HTMLFormElement | null;
              form?.requestSubmit();
            }}
            className="btn primary"
            style={{ fontSize: 12 }}
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {tc("save")}
          </button>
        </>
      }
    >
      <form id="metrics-edit-form" onSubmit={handleSave} className="flex flex-col gap-4">
        <div>
          <label className="label">{tFin("currentCash")}</label>
          <ValkNumberInput value={cash} onChange={setCash} prefix="R$" decimals={2} step={1000} min={0} placeholder="Ex: 500000,00" disabled={isSaving} />
        </div>
        <div>
          <label className="label">{tFin("monthlySpend")}</label>
          <ValkNumberInput value={burnRate} onChange={setBurnRate} prefix="R$" decimals={2} step={1000} min={0} placeholder="Ex: 35000,00" disabled={isSaving} />
        </div>
      </form>
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
  recentDecisions,
}: {
  userName: string;
  projects: Project[];
  activities: Activity[];
  metrics: MetricsSummary;
  pendingItems: PendingItem[];
  recentDecisions: RecentDecision[];
}) {
  const [dateStr, setDateStr] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const tDash = useTranslations("dashboard");
  const tFin = useTranslations("financial");

  useEffect(() => {
    setDateStr(format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR }));
  }, []);

  // MRR delta percentage
  const mrrDelta = metrics.prevMrr > 0
    ? ((metrics.totalMrr - metrics.prevMrr) / metrics.prevMrr * 100)
    : 0;

  return (
    <div className="fadeUp">
      {/* ═══ HERO: MRR + project summary ═══ */}
      <section
        className="grid gap-7 items-end"
        style={{
          gridTemplateColumns: "1.1fr 1fr",
          marginBottom: 40,
        }}
      >
        {/* Left: date + hero MRR */}
        <div>
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
              <span style={{ fontSize: 11, color: "var(--text-ghost)" }}>vs. mês anterior</span>
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
        </div>

        {/* Right: summary tally */}
        <div
          className="grid overflow-hidden"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            background: "var(--bg-1)",
          }}
        >
          {[
            { label: "Projetos", count: projects.length, color: "var(--text-primary)" },
            { label: "MRR", count: metrics.hasMetrics ? formatBRL(metrics.totalMrr, { compact: true }) : "—", color: "var(--status-traction)" },
            { label: "Clientes", count: metrics.hasMetrics ? metrics.totalClients : "—", color: "var(--status-discovery)" },
            {
              label: "Runway",
              count: metrics.runwayMonths !== null ? `${metrics.runwayMonths}m` : "—",
              color: metrics.runwayMonths === null ? "var(--text-muted)" : metrics.runwayMonths > 6 ? "var(--status-traction)" : metrics.runwayMonths >= 3 ? "var(--priority-high)" : "var(--primary)",
              last: true,
            },
          ].map((cell, i) => (
            <div
              key={cell.label}
              style={{
                padding: "16px 18px",
                borderRight: (cell as { last?: boolean }).last ? "none" : "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  fontWeight: 600,
                }}
              >
                {cell.label}
              </span>
              <span
                className="display"
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  color: cell.color,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {cell.count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ ACTIVE PROJECTS ═══ */}
      <section style={{ marginBottom: 44 }}>
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
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                    flex: 1,
                  }}
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

      {/* ═══ SUPPORTING ROW: Pending + Decisions ═══ */}
      <section
        className="grid gap-5"
        style={{
          gridTemplateColumns: "1fr 1fr",
          marginBottom: 36,
        }}
      >
        {/* Pending */}
        <div className="card" style={{ padding: 22 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h2 className="label">Pendentes · {getFirstName(userName)}</h2>
            <span className="mono" style={{ fontSize: 10, color: "var(--text-ghost)" }}>
              {pendingItems.length}
            </span>
          </div>
          {pendingItems.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-ghost)", textAlign: "center", padding: "24px 0" }}>
              Sem pendências. Foco no que importa.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingItems.slice(0, 6).map((item) => (
                <PendingItemRow key={`${item.source}-${item.id}`} item={item} />
              ))}
            </ul>
          )}
        </div>

        {/* Decisions */}
        <div className="card" style={{ padding: 22 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h2 className="label">Decisões recentes</h2>
            <Link href="/meetings" style={{ fontSize: 11, color: "var(--text-muted)" }}>
              todas
            </Link>
          </div>
          {recentDecisions.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-ghost)", textAlign: "center", padding: "24px 0" }}>
              Nenhuma decisão registrada
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {recentDecisions.map((d) => (
                <li key={d.id} className="flex" style={{ gap: 10, alignItems: "flex-start" }}>
                  <span
                    className="mono"
                    style={{ fontSize: 10, color: "var(--text-ghost)", width: 36, paddingTop: 2 }}
                  >
                    {format(new Date(d.date), "dd/MM", { locale: ptBR })}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Link
                      href={d.meeting_id ? `/meetings/${d.meeting_id}` : "#"}
                      style={{ fontSize: 12.5, color: "var(--text-primary)", lineHeight: 1.45 }}
                    >
                      {d.title}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ═══ ACTIVITY FEED ═══ */}
      <section>
        <div className="flex items-baseline justify-between" style={{ marginBottom: 14 }}>
          <h2 className="label">O que aconteceu</h2>
          <button style={{ fontSize: 11, color: "var(--text-muted)" }}>ver tudo</button>
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
                  <div
                    className="min-w-0 flex-1 truncate"
                    style={{ fontSize: 12.5, color: "var(--text-secondary)" }}
                  >
                    {activity.user && (
                      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {activity.user.name}
                      </span>
                    )}{" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      {getActionText(activity.action, activity.metadata)}
                    </span>
                  </div>
                  <span
                    suppressHydrationWarning
                    className="mono"
                    style={{ fontSize: 10, color: "var(--text-ghost)", flexShrink: 0 }}
                  >
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
