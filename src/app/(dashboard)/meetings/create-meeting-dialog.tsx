"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { createMeeting } from "./actions";

type User = { id: string; name: string; company_role: string | null };
type Project = { id: string; name: string };

const meetingTypes = [
  { value: "daily_ops", label: "Daily Ops" },
  { value: "biweekly", label: "Quinzenal de Sócios" },
  { value: "monthly", label: "Mensal de Resultado" },
  { value: "adhoc", label: "Avulsa" },
];

const autoSelectAllTypes = ["biweekly", "monthly"];

function generateTitle(type: string, dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  switch (type) {
    case "daily_ops":
      return `Daily - ${format(date, "dd/MM/yyyy", { locale: ptBR })}`;
    case "biweekly":
      return `Quinzenal - ${format(date, "dd/MM/yyyy", { locale: ptBR })}`;
    case "monthly":
      return `Mensal - ${format(date, "MMMM/yyyy", { locale: ptBR })}`;
    default:
      return "";
  }
}

const inputClass =
  "w-full rounded-lg border border-[#1A1A1A] bg-[#050505] px-3.5 py-2.5 text-[13px] text-[#ddd] placeholder-[#333] transition-all duration-200 focus:border-[#E24B4A] focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.06)]";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#444]";

function ParticipantAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[8px] font-semibold text-[#555]">
      {initials}
    </div>
  );
}

export function CreateMeetingDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [type, setType] = useState("daily_ops");
  const [scheduledAt, setScheduledAt] = useState("");
  const [title, setTitle] = useState("");
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );

  // Fetch users and projects on open
  useEffect(() => {
    if (!open) return;
    const supabase = createClient();

    supabase
      .from("users")
      .select("id, name, company_role")
      .order("name")
      .then(({ data }) => setUsers(data ?? []));

    supabase
      .from("projects")
      .select("id, name")
      .eq("status", "active")
      .order("name")
      .then(({ data }) => setProjects(data ?? []));
  }, [open]);

  // Auto-fill title when type or date changes (unless manually edited)
  useEffect(() => {
    if (titleManuallyEdited) return;
    setTitle(generateTitle(type, scheduledAt));
  }, [type, scheduledAt, titleManuallyEdited]);

  // Auto-select all participants for biweekly/monthly
  useEffect(() => {
    if (autoSelectAllTypes.includes(type) && users.length > 0) {
      setSelectedParticipants(users.map((u) => u.id));
    } else if (type === "adhoc") {
      setSelectedParticipants([]);
    }
  }, [type, users]);

  function toggleParticipant(userId: string) {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  function resetForm() {
    setType("daily_ops");
    setScheduledAt("");
    setTitle("");
    setTitleManuallyEdited(false);
    setSelectedParticipants([]);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createMeeting({
        title: title || (formData.get("title") as string),
        type,
        scheduled_at: scheduledAt,
        project_id: formData.get("project_id") as string,
        description: formData.get("description") as string,
        participant_ids: selectedParticipants,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Reunião agendada");
      setOpen(false);
      resetForm();
      router.push(`/meetings/${result.id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-[460px] gap-0 rounded-[14px] border border-[#1A1A1A] bg-[#0A0A0A] p-0"
      >
        <div className="shrink-0 px-7 pt-7">
          <DialogHeader className="gap-1">
            <DialogTitle className="font-display text-[17px] font-semibold text-[#eee]">
              Nova reunião
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[#555]">
              Agende uma reunião e defina os participantes
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex max-h-[60vh] flex-col gap-4.5 overflow-y-auto px-7 py-5">
            {/* Tipo */}
            <div>
              <label htmlFor="type" className={labelClass}>
                Tipo
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setTitleManuallyEdited(false);
                }}
                disabled={isPending}
                className={`${inputClass} appearance-none`}
              >
                {meetingTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Título */}
            <div>
              <label htmlFor="title" className={labelClass}>
                Título
              </label>
              <input
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleManuallyEdited(true);
                }}
                placeholder={
                  type === "adhoc" ? "Ex: Alinhamento com investidor" : ""
                }
                disabled={isPending}
                className={inputClass}
              />
            </div>

            {/* Data e hora */}
            <div>
              <label htmlFor="scheduled_at" className={labelClass}>
                Data e hora
              </label>
              <input
                id="scheduled_at"
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                disabled={isPending}
                className={inputClass}
              />
            </div>

            {/* Produto relacionado */}
            <div>
              <label htmlFor="project_id" className={labelClass}>
                Produto relacionado
              </label>
              <select
                id="project_id"
                name="project_id"
                defaultValue=""
                disabled={isPending}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Nenhum</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Participantes */}
            <div>
              <label className={labelClass}>Participantes</label>
              <div className="space-y-1 rounded-lg border border-[#1A1A1A] bg-[#050505] p-2">
                {users.map((u) => {
                  const selected = selectedParticipants.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleParticipant(u.id)}
                      disabled={isPending}
                      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors duration-150 ${
                        selected
                          ? "bg-white/[0.04]"
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-150 ${
                          selected
                            ? "border-[#E24B4A] bg-[#E24B4A]"
                            : "border-[#333]"
                        }`}
                      >
                        {selected && (
                          <Check size={10} strokeWidth={2.5} className="text-white" />
                        )}
                      </div>
                      <ParticipantAvatar name={u.name} />
                      <div className="min-w-0 text-left">
                        <p className="truncate text-[13px] text-[#ccc]">
                          {u.name}
                        </p>
                        {u.company_role && (
                          <p className="truncate text-[10px] text-[#444]">
                            {u.company_role}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
                {users.length === 0 && (
                  <p className="py-3 text-center text-[12px] text-[#333]">
                    Carregando...
                  </p>
                )}
              </div>
            </div>

            {/* Pauta inicial */}
            <div>
              <label htmlFor="description" className={labelClass}>
                Pauta inicial
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Tópicos a discutir..."
                disabled={isPending}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-[#141414] px-7 py-5">
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-lg px-4 py-2.5 text-[12px] text-[#555] transition-colors hover:text-[#888]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                Agendar
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
