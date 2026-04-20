"use client";

import { useTranslations } from "next-intl";

interface SprintBadgeProps {
  sprint: {
    id: string;
    number: number;
    name: string;
    status: string;
  };
}

const SPRINT_STATUS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  active: { bg: "rgba(226,75,74,0.12)", text: "#E24B4A", border: "rgba(226,75,74,0.25)" },
  planned: { bg: "rgba(107,114,128,0.12)", text: "#9CA3AF", border: "rgba(107,114,128,0.25)" },
  completed: { bg: "rgba(16,185,129,0.12)", text: "#10B981", border: "rgba(16,185,129,0.2)" },
  cancelled: { bg: "rgba(75,85,99,0.1)", text: "#6B7280", border: "rgba(75,85,99,0.15)" },
};

export function SprintBadge({ sprint }: SprintBadgeProps) {
  const t = useTranslations("sprints");
  const colors = SPRINT_STATUS_COLOR[sprint.status] ?? SPRINT_STATUS_COLOR.planned;
  const label = sprint.number === 99 ? "Pos-v1" : `S${sprint.number}`;

  return (
    <span
      className="inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
      title={`${sprint.name} · ${t(`status.${sprint.status}` as "status.active")}`}
    >
      {label}
    </span>
  );
}
