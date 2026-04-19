"use client";

import { formatBRL } from "@/lib/format";
import { DashboardCard } from "./DashboardCard";

interface FinancialHealthProps {
  currentCash: number | null;
  monthlyBurn: number | null;
  runwayMonths: number | null;
}

function Metric({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[12px] text-[#666]">{label}</span>
      <span
        className="font-display text-[18px] font-semibold"
        style={{ color: valueColor ?? "#EEE" }}
      >
        {value}
      </span>
    </div>
  );
}

export function FinancialHealthCard({
  currentCash,
  monthlyBurn,
  runwayMonths,
}: FinancialHealthProps) {
  const runwayColor =
    runwayMonths === null
      ? "#666"
      : runwayMonths > 6
        ? "#10B981"
        : runwayMonths > 3
          ? "#F59E0B"
          : "#E24B4A";

  return (
    <DashboardCard title="Saude financeira">
      <div className="space-y-3">
        <Metric label="Caixa" value={currentCash != null ? formatBRL(currentCash) : "—"} />
        <Metric
          label="Gasto mensal"
          value={monthlyBurn != null ? `${formatBRL(monthlyBurn)}/mes` : "—"}
        />
        <Metric
          label="Runway"
          value={
            runwayMonths !== null
              ? `${runwayMonths.toFixed(1).replace(".", ",")} meses`
              : "—"
          }
          valueColor={runwayColor}
        />
      </div>
    </DashboardCard>
  );
}
