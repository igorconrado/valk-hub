"use client";

import Link from "next/link";
import { DashboardCard } from "./DashboardCard";
import { PriorityChip } from "@/components/tasks/PriorityChip";

interface PendingItem {
  id: string;
  kind: "task" | "action_item";
  title: string;
  due_date: string | null;
  priority?: string;
  href: string;
}

function DueDate({ date }: { date: string }) {
  const d = new Date(date);
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return (
    <span
      suppressHydrationWarning
      className="font-mono text-[10px]"
      style={{ color: dd < new Date(new Date().setHours(0, 0, 0, 0)) ? "#E24B4A" : "#555" }}
    >
      {`${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`}
    </span>
  );
}

export function MyPendingCard({
  items,
  totalCount,
}: {
  items: PendingItem[];
  totalCount: number;
}) {
  if (items.length === 0) {
    return (
      <DashboardCard title="Minhas pendencias">
        <p className="py-6 text-center text-[13px] text-[#666]">
          Sem pendencias. Foco no que importa.
        </p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Minhas pendencias"
      action={totalCount > items.length ? { label: "Ver todas", href: "/tasks?assignee=me" } : null}
    >
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            <Link
              href={item.href}
              className="-mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-[#0D0D0D]"
            >
              {item.priority && <PriorityChip priority={item.priority} />}
              <span className="flex-1 truncate text-[13px] text-[#DDD]">{item.title}</span>
              {item.due_date && <DueDate date={item.due_date} />}
            </Link>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
