"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, Plus, Trash2, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ValkDialog,
  ValkInput,
  ValkNumberInput,
} from "@/components/ds";
import { RoleGate } from "@/components/role-gate";
import { useRole } from "@/lib/hooks/use-role";
import { saveMetricsSnapshot, deleteMetricsSnapshot } from "../actions";

type Snapshot = {
  id: string;
  date: string;
  data_json: Record<string, number | null>;
  source: string;
  created_by: string;
};

const METRIC_FIELDS = [
  { key: "mrr", label: "MRR (R$)", prefix: "R$ " },
  { key: "paying_customers", label: "Clientes pagantes", prefix: "" },
  { key: "churn", label: "Churn mensal (%)", prefix: "", suffix: "%" },
  { key: "cac", label: "CAC (R$)", prefix: "R$ " },
  { key: "ltv", label: "LTV (R$)", prefix: "R$ " },
  { key: "dau", label: "DAU", prefix: "" },
  { key: "mau", label: "MAU", prefix: "" },
];


function formatMetric(value: number | null | undefined, prefix = "", suffix = "") {
  if (value === null || value === undefined) return "—";
  const formatted =
    value >= 1000
      ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
      : String(value);
  return `${prefix}${formatted}${suffix}`;
}

function ChangeIndicator({
  current,
  previous,
  invertColor,
}: {
  current: number | null | undefined;
  previous: number | null | undefined;
  invertColor?: boolean;
}) {
  if (
    current === null ||
    current === undefined ||
    previous === null ||
    previous === undefined ||
    previous === 0
  )
    return null;

  const pct = ((current - previous) / previous) * 100;
  const isUp = pct > 0;
  const color = invertColor
    ? isUp
      ? "#E24B4A"
      : "#10B981"
    : isUp
      ? "#10B981"
      : "#E24B4A";

  return (
    <span className="flex items-center gap-0.5 text-[10px] font-medium" style={{ color }}>
      {isUp ? (
        <TrendingUp size={10} strokeWidth={2} />
      ) : (
        <TrendingDown size={10} strokeWidth={2} />
      )}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function AddSnapshotDialog({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const today = new Date().toISOString().split("T")[0];
  const [metricValues, setMetricValues] = useState<Record<string, number | null>>(
    () => Object.fromEntries(METRIC_FIELDS.map((f) => [f.key, null]))
  );

  function setMetric(key: string, val: number) {
    setMetricValues((prev) => ({ ...prev, [key]: val || null }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const date = fd.get("date") as string;

    startTransition(async () => {
      const result = await saveMetricsSnapshot(projectId, date, metricValues);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Metricas salvas");
        onOpenChange(false);
      }
    });
  }

  return (
    <ValkDialog
      open={open}
      onClose={() => onOpenChange(false)}
      title="Snapshot de metricas"
      subtitle="Registre os numeros atuais do produto"
      footer={
        <>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-lg px-4 py-2.5 text-[12px] text-[#555] transition-colors hover:text-[#888]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="add-snapshot-form"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Salvar
          </button>
        </>
      }
    >
      <form id="add-snapshot-form" onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div>
          <label htmlFor="date" className="label">
            Data
          </label>
          <ValkInput
            id="date"
            name="date"
            type="date"
            defaultValue={today}
            required
            disabled={isPending}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {METRIC_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="label">
                {f.label}
              </label>
              <ValkNumberInput
                value={metricValues[f.key] ?? 0}
                onChange={(v) => setMetric(f.key, v)}
                prefix={f.prefix || undefined}
                suffix={"suffix" in f ? (f as { suffix: string }).suffix || undefined : undefined}
                step={f.key === "churn" ? 0.1 : 1}
                min={0}
                disabled={isPending}
              />
            </div>
          ))}
        </div>
      </form>
    </ValkDialog>
  );
}

function MetricTooltip({
  active,
  payload,
  label,
  prefix = "",
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  prefix?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#1A1A1A] bg-[#111] px-3 py-2 shadow-lg">
      <p className="text-[10px] text-[#555]">{label}</p>
      <p className="mt-0.5 font-display text-[14px] font-semibold text-[#eee]">
        {prefix}{payload[0].value.toLocaleString("pt-BR")}{suffix}
      </p>
    </div>
  );
}

function MetricChart({
  title,
  data,
  dataKey,
  color,
  prefix = "",
  suffix = "",
}: {
  title: string;
  data: Array<Record<string, unknown>>;
  dataKey: string;
  color: string;
  prefix?: string;
  suffix?: string;
}) {
  if (data.length <= 1) return null;

  return (
    <div className="rounded-[10px] border border-[#141414] bg-[#0A0A0A] p-5">
      <h2 className="eyebrow mb-4">
        {title}
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.08} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#141414" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#444", fontFamily: "var(--font-sans)" }}
            axisLine={{ stroke: "#141414" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#444", fontFamily: "var(--font-sans)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={
              <MetricTooltip prefix={prefix} suffix={suffix} />
            }
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#fill-${dataKey})`}
            dot={{ fill: color, r: 3, strokeWidth: 0 }}
            activeDot={{ fill: color, r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MetricsTab({
  projectId,
  snapshots,
}: {
  projectId: string;
  snapshots: Snapshot[];
}) {
  const t = useTranslations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { isAdmin } = useRole();

  if (snapshots.length === 0) {
    return (
      <div className="py-5">
        <div className="flex flex-col items-center justify-center py-12">
          <BarChart3 size={28} strokeWidth={1.2} className="text-[#1A1A1A]" />
          <p className="mt-3 text-[13px] text-[#444]">
            Sem dados ainda. Registre o primeiro snapshot.
          </p>
          <RoleGate allowed={["admin", "operator"]}>
            <button
              onClick={() => setDialogOpen(true)}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#E24B4A] px-4 py-2 text-[12px] font-medium text-white transition-colors duration-150 hover:bg-[#D4403F]"
            >
              <Plus size={14} strokeWidth={1.5} />
              Adicionar metricas
            </button>
          </RoleGate>
        </div>
        <AddSnapshotDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          projectId={projectId}
        />
      </div>
    );
  }

  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const latest = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  // Chart data per metric
  const mrrData = sorted
    .filter((s) => s.data_json.mrr != null)
    .map((s) => ({
      date: format(parseISO(s.date), "dd MMM", { locale: ptBR }),
      mrr: s.data_json.mrr,
    }));

  const clientsData = sorted
    .filter((s) => s.data_json.paying_customers != null)
    .map((s) => ({
      date: format(parseISO(s.date), "dd MMM", { locale: ptBR }),
      clients: s.data_json.paying_customers,
    }));

  const churnData = sorted
    .filter((s) => s.data_json.churn != null)
    .map((s) => ({
      date: format(parseISO(s.date), "dd MMM", { locale: ptBR }),
      churn: s.data_json.churn,
    }));

  function handleDelete(snapshotId: string) {
    if (!confirm(t("confirmations.deleteSnapshot"))) return;
    startTransition(async () => {
      const result = await deleteMetricsSnapshot(snapshotId, projectId);
      if (result.error) toast.error(result.error);
      else toast.success("Snapshot excluido");
    });
  }

  return (
    <div className="py-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#444]">
          {snapshots.length} snapshot{snapshots.length !== 1 ? "s" : ""}
        </span>
        <RoleGate allowed={["admin", "operator"]}>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-[#222] bg-transparent px-2.5 py-1 text-[11px] font-medium text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc]"
          >
            <Plus size={12} strokeWidth={1.5} />
            Adicionar metricas
          </button>
        </RoleGate>
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-3">
        <MetricChart
          title="MRR"
          data={mrrData}
          dataKey="mrr"
          color="#E24B4A"
          prefix="R$ "
        />
        <MetricChart
          title="Clientes"
          data={clientsData}
          dataKey="clients"
          color="#3B82F6"
        />
        <MetricChart
          title="Churn"
          data={churnData}
          dataKey="churn"
          color="#F59E0B"
          suffix="%"
        />
      </div>

      {/* Current numbers */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {METRIC_FIELDS.map((f) => {
          const value = latest.data_json[f.key];
          if (value === null || value === undefined) return null;
          const prev = previous?.data_json[f.key];
          const isChurn = f.key === "churn" || f.key === "cac";

          return (
            <div
              key={f.key}
              className="rounded-[10px] border border-[#141414] bg-[#0A0A0A] p-3.5"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#444]">
                {f.label}
              </span>
              <div className="mt-1 flex items-end gap-2">
                <span className="font-display text-[24px] font-semibold text-[#ddd]">
                  {formatMetric(value, f.prefix, f.suffix)}
                </span>
                <ChangeIndicator
                  current={value}
                  previous={prev}
                  invertColor={isChurn}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* History */}
      <div>
        <h2 className="eyebrow mb-3">
          Historico
        </h2>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header */}
            <div className="flex items-center border-b border-[#0F0F0F] pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#333]">
              <div className="w-[80px]">Data</div>
              <div className="flex-1">MRR</div>
              <div className="flex-1">Clientes</div>
              <div className="flex-1">Churn</div>
              <div className="flex-1">CAC</div>
              <div className="flex-1">LTV</div>
              <div className="flex-1">DAU</div>
              <div className="flex-1">MAU</div>
              {isAdmin && <div className="w-8" />}
            </div>
            {/* Rows */}
            {[...sorted].reverse().map((s) => (
              <div
                key={s.id}
                className="flex items-center border-b border-[#0F0F0F] py-2.5 text-[12px] text-[#888]"
              >
                <div className="w-[80px] text-[11px] text-[#555]">
                  {format(parseISO(s.date), "dd MMM", { locale: ptBR })}
                </div>
                <div className="flex-1">
                  {formatMetric(s.data_json.mrr, "R$ ")}
                </div>
                <div className="flex-1">
                  {s.data_json.paying_customers ?? "—"}
                </div>
                <div className="flex-1">
                  {s.data_json.churn !== null && s.data_json.churn !== undefined
                    ? `${s.data_json.churn}%`
                    : "—"}
                </div>
                <div className="flex-1">
                  {formatMetric(s.data_json.cac, "R$ ")}
                </div>
                <div className="flex-1">
                  {formatMetric(s.data_json.ltv, "R$ ")}
                </div>
                <div className="flex-1">{s.data_json.dau ?? "—"}</div>
                <div className="flex-1">{s.data_json.mau ?? "—"}</div>
                {isAdmin && (
                  <div className="w-8">
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={isPending}
                      className="text-[#333] transition-colors hover:text-[#E24B4A] disabled:opacity-50"
                    >
                      <Trash2 size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddSnapshotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectId={projectId}
      />
    </div>
  );
}
