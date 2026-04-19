"use client";

import { useTranslations } from "next-intl";
import { PRIORITY_COLORS } from "@/lib/task-colors";

const PRIORITY_LETTER_PT: Record<string, string> = {
  low: "B",
  medium: "M",
  high: "A",
  urgent: "U",
};

const PRIORITY_LETTER_EN: Record<string, string> = {
  low: "L",
  medium: "M",
  high: "H",
  urgent: "U",
};

interface PriorityChipProps {
  priority: string;
  locale?: string;
}

export function PriorityChip({ priority, locale }: PriorityChipProps) {
  const t = useTranslations("tasks.priorities");
  const actualLocale = locale ?? "pt-BR";
  const letterMap = actualLocale === "en" ? PRIORITY_LETTER_EN : PRIORITY_LETTER_PT;
  const letter = letterMap[priority] ?? "?";
  const color = PRIORITY_COLORS[priority] ?? "#6B7280";

  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-md font-mono text-[10px] font-bold leading-none"
      style={{
        backgroundColor: `${color}1A`,
        color,
        border: `1px solid ${color}33`,
      }}
      title={t(priority as "low" | "medium" | "high" | "urgent")}
      aria-label={t(priority as "low" | "medium" | "high" | "urgent")}
    >
      {letter}
    </span>
  );
}
