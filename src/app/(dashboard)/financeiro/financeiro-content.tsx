"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatBRL } from "@/lib/format";
import { ValkDialog, ValkNumberInput } from "@/components/ds";
import { saveCompanyMetrics } from "../dashboard-actions";
import { useTransition } from "react";

type HistoryRow = {
  id: string;
  date: string;
  cash: number;
  burn: number;
  runway: number | null;
  source: string;
};

function BigMetric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-[#141414] bg-[#0A0A0A] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#444]">{label}</p>
      <p
        className="mt-3 font-display text-[36px] font-bold leading-none"
        style={{ color: color ?? "#EEE" }}
      >
        {value}
      </p>
    </div>
  );
}

function UpdateDialog({
  open,
  onClose,
  latest,
}: {
  open: boolean;
  onClose: () => void;
  latest: HistoryRow | null;
}) {
  const [isSaving, startTransition] = useTransition();
  const [cash, setCash] = useState(latest?.cash ?? 0);
  const [burnRate, setBurnRate] = useState(latest?.burn ?? 0);
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
      onClose();
    });
  }

  return (
    <ValkDialog
      open={open}
      onClose={onClose}
      title={tFin("title")}
      subtitle={tFin("subtitle")}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg px-4 py-2.5 text-[12px] text-[#555] transition-colors hover:text-[#888]"
          >
            {tc("cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:bg-[#D4403F] disabled:opacity-70"
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
          <ValkNumberInput value={cash} onChange={setCash} prefix="R$" decimals={2} step={1000} min={0} disabled={isSaving} />
        </div>
        <div>
          <label className="label">{tFin("monthlySpend")}</label>
          <ValkNumberInput value={burnRate} onChange={setBurnRate} prefix="R$" decimals={2} step={1000} min={0} disabled={isSaving} />
        </div>
        <p className="text-[12px] text-[#555]">
          {tFin("runway")}: <span className="font-mono text-[#AAA]">{runwayLabel}</span>
        </p>
      </div>
    </ValkDialog>
  );
}

export function FinanceiroContent({ history }: { history: HistoryRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const latest = history[0] ?? null;

  const runwayColor =
    latest?.runway == null
      ? "#666"
      : latest.runway > 6
        ? "#10B981"
        : latest.runway > 3
          ? "#F59E0B"
          : "#E24B4A";

  // Chart data (chronological order)
  const chartData = [...history].reverse().map((row) => ({
    date: format(parseISO(row.date), "MMM yy", { locale: ptBR }),
    caixa: row.cash,
  }));

  return (
    <div className="fadeUp space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1
            className="display"
            style={{ fontSize: 28, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}
          >
            Financeiro
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "6px 0 0" }}>
            Saude financeira da empresa
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#E24B4A] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#D4403F]"
        >
          <Pencil size={14} /> Atualizar
        </button>
      </div>

      {/* Big metrics */}
      {latest ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <BigMetric label="Caixa atual" value={formatBRL(latest.cash)} />
          <BigMetric label="Gasto mensal" value={`${formatBRL(latest.burn)}/mes`} />
          <BigMetric
            label="Runway"
            value={
              latest.runway != null
                ? `${latest.runway.toFixed(1).replace(".", ",")} meses`
                : "—"
            }
            color={runwayColor}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-[#141414] bg-[#0A0A0A] p-12 text-center">
          <p className="text-[13px] text-[#555]">Sem registros ainda.</p>
          <button
            onClick={() => setDialogOpen(true)}
            className="mt-4 rounded-lg bg-[#E24B4A] px-4 py-2 text-[12px] font-medium text-white transition hover:bg-[#D4403F]"
          >
            Configurar
          </button>
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="rounded-xl border border-[#141414] bg-[#0A0A0A] p-5">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[#444]">
            Evolucao do caixa
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#141414" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#555" }}
                axisLine={{ stroke: "#1A1A1A" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#555" }}
                axisLine={{ stroke: "#1A1A1A" }}
                tickLine={false}
                tickFormatter={(v: number) =>
                  `R$${(v / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111",
                  border: "1px solid #1F1F1F",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#DDD",
                }}
                formatter={(v) => [formatBRL(Number(v)), "Caixa"]}
              />
              <Line
                type="monotone"
                dataKey="caixa"
                stroke="#E24B4A"
                strokeWidth={2}
                dot={{ r: 3, fill: "#E24B4A" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History table */}
      {history.length > 0 && (
        <div className="rounded-xl border border-[#141414] bg-[#0A0A0A] overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[#0F0F0F] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#333]">
            <div className="w-[100px]">Data</div>
            <div className="flex-1">Caixa</div>
            <div className="flex-1">Gasto mensal</div>
            <div className="w-[100px] text-right">Runway</div>
          </div>
          {history.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-3 border-b border-[#0F0F0F] px-5 py-3 transition hover:bg-white/[0.01]"
            >
              <div className="w-[100px] font-mono text-[11px] text-[#666]">
                {format(parseISO(row.date), "MMM yyyy", { locale: ptBR })}
              </div>
              <div className="flex-1 text-[13px] text-[#DDD]">{formatBRL(row.cash)}</div>
              <div className="flex-1 text-[13px] text-[#DDD]">{formatBRL(row.burn)}</div>
              <div className="w-[100px] text-right font-mono text-[12px]" style={{
                color: row.runway == null ? "#555" : row.runway > 6 ? "#10B981" : row.runway > 3 ? "#F59E0B" : "#E24B4A",
              }}>
                {row.runway != null ? `${row.runway.toFixed(1).replace(".", ",")}m` : "—"}
              </div>
            </div>
          ))}
        </div>
      )}

      <UpdateDialog open={dialogOpen} onClose={() => setDialogOpen(false)} latest={latest} />
    </div>
  );
}
