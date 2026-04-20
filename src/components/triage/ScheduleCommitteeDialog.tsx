"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { ValkDialog, ValkSelect } from "@/components/ds";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ScheduleCommitteeDialogProps {
  open: boolean;
  onClose: () => void;
}

function getNextTuesdayAt14(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilTuesday = (2 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilTuesday);
  d.setHours(14, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export function ScheduleCommitteeDialog({ open, onClose }: ScheduleCommitteeDialogProps) {
  const t = useTranslations("triage.scheduleDialog");
  const tc = useTranslations("common");
  const router = useRouter();

  const [dateTime, setDateTime] = useState(getNextTuesdayAt14);
  const [duration, setDuration] = useState("1h");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSchedule() {
    if (!dateTime) return;
    setSaving(true);
    const supabase = createClient();

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) { setSaving(false); toast.error("Nao autenticado"); return; }

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", authData.user.id)
      .single();

    const { data: meeting, error } = await supabase
      .from("meetings")
      .insert({
        type: "biweekly",
        title: "Comite de triagem",
        date: new Date(dateTime).toISOString(),
        is_triage_committee: true,
        status: "scheduled",
        agenda_md: notes || null,
        created_by: userData?.id,
      })
      .select("id")
      .single();

    if (error || !meeting) {
      setSaving(false);
      toast.error(error?.message ?? "Erro ao criar");
      return;
    }

    // Add all founders as participants
    const { data: founders } = await supabase
      .from("users")
      .select("id")
      .in("partnership_type", ["founder_operator", "founder_investor"]);

    if (founders && founders.length > 0) {
      await supabase
        .from("meeting_participants")
        .insert(founders.map((u) => ({ meeting_id: meeting.id, user_id: u.id })));
    }

    setSaving(false);
    toast.success("Comite agendado");
    onClose();
    router.push(`/meetings/${meeting.id}`);
  }

  return (
    <ValkDialog
      open={open}
      onClose={onClose}
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-4 py-2.5 text-[12px] text-[#555] transition-colors hover:text-[#888]"
          >
            {tc("cancel")}
          </button>
          <button
            onClick={handleSchedule}
            disabled={saving || !dateTime}
            className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:bg-[#D4403F] disabled:opacity-70"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {t("confirmCreate")}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">{t("dateLabel")}</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] px-3 py-2.5 text-[13px] text-white transition focus:border-[#E24B4A] focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-[#555]">{t("nextTuesdayDefault")}</p>
        </div>

        <div>
          <label className="label">{t("durationLabel")}</label>
          <ValkSelect
            value={duration}
            onValueChange={setDuration}
            options={[
              { value: "30min", label: t("durationOptions.30min") },
              { value: "1h", label: t("durationOptions.1h") },
              { value: "1h30", label: t("durationOptions.1h30") },
              { value: "2h", label: t("durationOptions.2h") },
            ]}
          />
        </div>

        <div>
          <label className="label">{t("notesLabel")}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("notesPlaceholder")}
            rows={4}
            className="w-full resize-none rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] px-3 py-2.5 text-[13px] text-white placeholder:text-[#555] transition focus:border-[#E24B4A] focus:outline-none"
          />
        </div>
      </div>
    </ValkDialog>
  );
}
