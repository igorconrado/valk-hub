"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ValkDialog,
  Avatar,
  ValkInput,
  ValkTextarea,
  ValkSelect,
  type ValkSelectOption,
} from "@/components/ds";
import { createClient } from "@/lib/supabase/client";
import { createMeeting } from "./actions";

type User = { id: string; name: string; company_role: string | null };
type Project = { id: string; name: string };

const meetingTypes: ValkSelectOption[] = [
  { value: "daily_ops", label: "Daily Ops" },
  { value: "biweekly", label: "Quinzenal de Socios" },
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
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");

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
    setProjectId("");
    setDescription("");
  }

  const projectOptions: ValkSelectOption[] = [
    { value: "", label: "Nenhum" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const result = await createMeeting({
        title,
        type,
        scheduled_at: scheduledAt,
        project_id: projectId,
        description,
        participant_ids: selectedParticipants,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Reuniao agendada");
      setOpen(false);
      resetForm();
      router.push(`/meetings/${result.id}`);
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {children}
      </span>

      <ValkDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Nova reuniao"
        subtitle="Agende uma reuniao e defina os participantes"
        footer={
          <>
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
              form="create-meeting-form"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Agendar
            </button>
          </>
        }
      >
        <form id="create-meeting-form" onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          {/* Tipo */}
          <div>
            <label className="label">Tipo</label>
            <ValkSelect
              value={type}
              onValueChange={(v) => {
                setType(v);
                setTitleManuallyEdited(false);
              }}
              options={meetingTypes}
              disabled={isPending}
            />
          </div>

          {/* Titulo */}
          <div>
            <label className="label">Titulo</label>
            <ValkInput
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
            />
          </div>

          {/* Data e hora */}
          <div>
            <label className="label">Data e hora</label>
            <ValkInput
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Produto relacionado */}
          <div>
            <label className="label">Produto relacionado</label>
            <ValkSelect
              value={projectId}
              onValueChange={setProjectId}
              options={projectOptions}
              disabled={isPending}
            />
          </div>

          {/* Participantes */}
          <div>
            <label className="label">Participantes</label>
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
                    <Avatar
                      user={{
                        name: u.name,
                        initials: u.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
                        color: "#555",
                      }}
                      size={24}
                    />
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
            <label className="label">Pauta inicial</label>
            <ValkTextarea
              name="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Topicos a discutir..."
              disabled={isPending}
            />
          </div>
        </form>
      </ValkDialog>
    </>
  );
}
