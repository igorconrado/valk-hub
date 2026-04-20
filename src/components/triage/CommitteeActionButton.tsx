"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Users, Clock } from "lucide-react";
import { ScheduleCommitteeDialog } from "./ScheduleCommitteeDialog";

interface CommitteeActionButtonProps {
  activeCommittee: { id: string; date: string; status: string } | null;
}

export function CommitteeActionButton({ activeCommittee }: CommitteeActionButtonProps) {
  const t = useTranslations("triage.actions");
  const router = useRouter();
  const [scheduleOpen, setScheduleOpen] = useState(false);

  if (!activeCommittee) {
    return (
      <>
        <button
          onClick={() => setScheduleOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#E24B4A] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#D43C3B]"
        >
          <Users size={14} /> {t("scheduleCommittee")}
        </button>
        <ScheduleCommitteeDialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
      </>
    );
  }

  if (activeCommittee.status === "in_progress") {
    return (
      <button
        onClick={() => router.push(`/meetings/${activeCommittee.id}`)}
        className="inline-flex items-center gap-2 rounded-lg bg-[#E24B4A] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#D43C3B] animate-pulse"
      >
        <Clock size={14} /> {t("resumeCommittee")}
      </button>
    );
  }

  const committeeDate = new Date(activeCommittee.date);
  const today = new Date();
  const isToday = committeeDate.toDateString() === today.toDateString();

  if (isToday) {
    return (
      <button
        onClick={() => router.push(`/meetings/${activeCommittee.id}`)}
        className="inline-flex items-center gap-2 rounded-lg bg-[#E24B4A] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#D43C3B]"
      >
        <Users size={14} /> {t("committeeToday")}
      </button>
    );
  }

  const diffDays = Math.ceil((committeeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <button
      onClick={() => router.push(`/meetings/${activeCommittee.id}`)}
      className="inline-flex items-center gap-2 rounded-lg border border-[#E24B4A33] bg-transparent px-4 py-2 text-[13px] text-[#E24B4A] transition hover:bg-[rgba(226,75,74,0.08)]"
    >
      <Users size={14} /> {t("viewCommittee", { days: diffDays })}
    </button>
  );
}
