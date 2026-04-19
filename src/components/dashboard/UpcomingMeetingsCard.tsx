"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardCard } from "./DashboardCard";

interface MeetingItem {
  id: string;
  type: string;
  title: string | null;
  date: string;
}

const TYPE_LABEL: Record<string, string> = {
  daily_ops: "Daily",
  biweekly: "Quinzenal",
  monthly: "Mensal",
  adhoc: "Avulsa",
};

const TYPE_COLOR: Record<string, string> = {
  daily_ops: "#3B82F6",
  biweekly: "#8B5CF6",
  monthly: "#E24B4A",
  adhoc: "#888",
};

export function UpcomingMeetingsCard({ meetings }: { meetings: MeetingItem[] }) {
  if (meetings.length === 0) {
    return (
      <DashboardCard title="Proximas reunioes">
        <p className="py-6 text-center text-[13px] text-[#666]">
          Nenhuma reuniao agendada.
        </p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Proximas reunioes"
      action={{ label: "Ver agenda", href: "/meetings" }}
    >
      <ul className="space-y-3">
        {meetings.map((m) => (
          <li key={m.id}>
            <Link
              href={`/meetings/${m.id}`}
              className="-mx-2 block rounded-lg px-2 py-1.5 transition hover:bg-[#0D0D0D]"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: TYPE_COLOR[m.type] ?? "#888" }}
                />
                <span className="text-[12px] text-[#888]">{TYPE_LABEL[m.type] ?? m.type}</span>
              </div>
              <p className="mt-0.5 text-[13px] text-[#DDD]">
                {m.title ?? TYPE_LABEL[m.type] ?? m.type}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-[#555]">
                {format(parseISO(m.date), "EEE dd/MM 'as' HH:mm", { locale: ptBR })}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
