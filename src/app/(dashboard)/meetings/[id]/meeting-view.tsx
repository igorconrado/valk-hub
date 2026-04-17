"use client";

import {
  useState,
  useRef,
  useCallback,
  useTransition,
  useEffect,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format, isPast, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Check,
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Plus,
  Circle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RoleGate } from "@/components/role-gate";
import { useRole } from "@/lib/hooks/use-role";
import { DocumentEditor } from "@/components/editor/document-editor";
import {
  updateMeetingStatus,
  saveMeetingNotes,
  createDecision,
  createActionItem,
  toggleActionItem,
} from "../actions";

// ── Types ──────────────────────────────────────────────

type Participant = {
  user_id: string;
  role: string;
  user: { id: string; name: string; company_role: string | null } | { id: string; name: string; company_role: string | null }[] | null;
};

type Meeting = {
  id: string;
  title: string;
  type: string;
  status: string;
  scheduled_at: string;
  notes: string | null;
  description: string | null;
  project_id: string | null;
  updated_at: string;
  project: { id: string; name: string } | { id: string; name: string }[] | null;
  meeting_participants: Participant[];
};

type Decision = {
  id: string;
  title: string;
  description: string | null;
  impact: string | null;
  status: string;
  decided_at: string | null;
  created_at: string;
  decided_by_user: { id: string; name: string } | { id: string; name: string }[] | null;
};

type ActionItem = {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  assignee: { id: string; name: string } | { id: string; name: string }[] | null;
};

type User = { id: string; name: string; company_role: string | null };
type Project = { id: string; name: string };

// ── Helpers ────────────────────────────────────────────

function resolve<T>(val: T | T[] | null): T | null {
  if (val == null) return null;
  if (Array.isArray(val)) return val[0] ?? null;
  return val;
}

// ── Config maps ────────────────────────────────────────

const typeConfig: Record<string, { label: string; color: string }> = {
  daily_ops: { label: "Daily", color: "#3B82F6" },
  biweekly: { label: "Quinzenal", color: "#8B5CF6" },
  monthly: { label: "Mensal", color: "#E24B4A" },
  adhoc: { label: "Avulsa", color: "#888" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Agendada", color: "#444" },
  in_progress: { label: "Em andamento", color: "#3B82F6" },
  completed: { label: "Concluída", color: "#10B981" },
  cancelled: { label: "Cancelada", color: "#666" },
};

const impactConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Baixo", color: "#555" },
  medium: { label: "Médio", color: "#E8A840" },
  high: { label: "Alto", color: "#E86B6A" },
  critical: { label: "Crítico", color: "#E24B4A" },
};

const inputClass =
  "w-full rounded-lg border border-[#1A1A1A] bg-[#050505] px-3.5 py-2.5 text-[13px] text-[#ddd] placeholder-[#333] transition-all duration-200 focus:border-[#E24B4A] focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.06)]";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#444]";

// ── Badge components ───────────────────────────────────

function Badge({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span
      className="inline-flex shrink-0 rounded px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: `${color}10`,
        color,
        border: `1px solid ${color}20`,
      }}
    >
      {label}
    </span>
  );
}

function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[8px] font-semibold text-[#555]"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-semibold uppercase tracking-wider text-[#333]">
      {children}
    </h2>
  );
}

// ── Section 1: Notes editor ────────────────────────────

function NotesSection({
  meetingId,
  initialNotes,
  canEdit,
  updatedAt,
}: {
  meetingId: string;
  initialNotes: string;
  canEdit: boolean;
  updatedAt: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">(
    "idle"
  );
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timeAgo = formatDistanceToNow(new Date(updatedAt), {
    addSuffix: true,
    locale: ptBR,
  });

  const doSave = useCallback(
    async (content: string) => {
      setSaveStatus("saving");
      const result = await saveMeetingNotes(meetingId, content);
      if (result.error) {
        toast.error(result.error);
        setSaveStatus("idle");
      } else {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    },
    [meetingId]
  );

  const debouncedSave = useCallback(
    (content: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        doSave(content);
      }, 2000);
    },
    [doSave]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function handleChange(content: string) {
    setNotes(content);
    if (canEdit) debouncedSave(content);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>Pauta &amp; Ata</SectionLabel>
        <span className="flex items-center gap-1 text-[11px] text-[#333]">
          {saveStatus === "saving" ? (
            <>
              <Loader2 size={10} className="animate-spin text-[#555]" />
              Salvando...
            </>
          ) : saveStatus === "saved" ? (
            <>
              <Check size={10} className="text-[#10B981]" />
              Salvo
            </>
          ) : (
            `Salvo ${timeAgo}`
          )}
        </span>
      </div>
      <DocumentEditor
        content={notes}
        onChange={handleChange}
        editable={canEdit}
        placeholder="Registre a pauta e anotações da reunião..."
      />
    </div>
  );
}

// ── Section 2: Decisions ───────────────────────────────

function CreateDecisionDialog({
  meetingId,
  projectId,
  participants,
  projects,
  children,
}: {
  meetingId: string;
  projectId: string | null;
  participants: Participant[];
  projects: Project[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedDeciders, setSelectedDeciders] = useState<string[]>([]);

  function toggleDecider(id: string) {
    setSelectedDeciders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createDecision({
        meeting_id: meetingId,
        project_id: (fd.get("project_id") as string) || projectId || "",
        title: fd.get("title") as string,
        impact: fd.get("impact") as string,
        decided_by_ids: selectedDeciders,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Decisão registrada");
      setOpen(false);
      setSelectedDeciders([]);
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
              Registrar decisão
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[#555]">
              Documente uma decisão tomada nesta reunião
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex max-h-[60vh] flex-col gap-4.5 overflow-y-auto px-7 py-5">
            {/* Descrição */}
            <div>
              <label htmlFor="dec-title" className={labelClass}>
                Descrição
              </label>
              <textarea
                id="dec-title"
                name="title"
                required
                rows={3}
                placeholder="O que foi decidido?"
                disabled={isPending}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Impacto */}
            <div>
              <label htmlFor="dec-impact" className={labelClass}>
                Impacto
              </label>
              <select
                id="dec-impact"
                name="impact"
                defaultValue="medium"
                disabled={isPending}
                className={`${inputClass} appearance-none`}
              >
                <option value="low">Baixo</option>
                <option value="medium">Médio</option>
                <option value="high">Alto</option>
                <option value="critical">Crítico</option>
              </select>
            </div>

            {/* Quem decidiu */}
            <div>
              <label className={labelClass}>Quem decidiu</label>
              <div className="space-y-1 rounded-lg border border-[#1A1A1A] bg-[#050505] p-2">
                {participants.map((p) => {
                  const u = resolve(p.user);
                  if (!u) return null;
                  const selected = selectedDeciders.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleDecider(u.id)}
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
                          <Check
                            size={10}
                            strokeWidth={2.5}
                            className="text-white"
                          />
                        )}
                      </div>
                      <Avatar name={u.name} />
                      <span className="text-[13px] text-[#ccc]">
                        {u.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Produto */}
            <div>
              <label htmlFor="dec-project" className={labelClass}>
                Produto
              </label>
              <select
                id="dec-project"
                name="project_id"
                defaultValue={projectId ?? ""}
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
                Registrar
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DecisionsSection({
  decisions,
  meetingId,
  projectId,
  participants,
  projects,
  canEdit,
}: {
  decisions: Decision[];
  meetingId: string;
  projectId: string | null;
  participants: Participant[];
  projects: Project[];
  canEdit: boolean;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>Decisões</SectionLabel>
        {canEdit && (
          <CreateDecisionDialog
            meetingId={meetingId}
            projectId={projectId}
            participants={participants}
            projects={projects}
          >
            <button className="flex items-center gap-1 text-[11px] text-[#555] transition-colors hover:text-[#888]">
              <Plus size={12} strokeWidth={1.5} />
              Registrar decisão
            </button>
          </CreateDecisionDialog>
        )}
      </div>

      {decisions.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-[#333]">
          Nenhuma decisão registrada
        </p>
      ) : (
        <div className="space-y-2">
          {decisions.map((d) => {
            const imp = impactConfig[d.impact ?? "medium"] ?? impactConfig.medium;
            const decider = resolve(d.decided_by_user);
            return (
              <div
                key={d.id}
                className="rounded-xl border border-[#141414] bg-[#0A0A0A] p-4"
              >
                <p className="text-[14px] leading-relaxed text-[#ddd]">
                  {d.title}
                </p>
                <div className="mt-2.5 flex items-center gap-2.5">
                  <Badge label={imp.label} color={imp.color} />
                  {decider && (
                    <div className="flex items-center gap-1.5">
                      <Avatar name={decider.name} size={20} />
                      <span className="text-[11px] text-[#555]">
                        {decider.name}
                      </span>
                    </div>
                  )}
                  {d.decided_at && (
                    <span className="text-[11px] text-[#333]">
                      {format(new Date(d.decided_at), "dd MMM yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Section 3: Action Items ────────────────────────────

function ActionItemRow({
  item,
  meetingId,
  canEdit,
}: {
  item: ActionItem;
  meetingId: string;
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const assignee = resolve(item.assignee);
  const isDone = item.status === "done";
  const isOverdue =
    !isDone && item.due_date && isPast(new Date(item.due_date));

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleActionItem(item.id, meetingId);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#141414] bg-[#0A0A0A] px-4 py-3">
      <button
        onClick={handleToggle}
        disabled={!canEdit || isPending}
        className="mt-0.5 shrink-0 text-[#555] transition-colors hover:text-[#888] disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isDone ? (
          <CheckCircle2
            size={16}
            strokeWidth={1.5}
            className="text-[#10B981]"
          />
        ) : (
          <Circle size={16} strokeWidth={1.5} />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`text-[13px] leading-relaxed ${
            isDone ? "text-[#555] line-through" : "text-[#ddd]"
          }`}
        >
          {item.title}
        </p>
        <div className="mt-1.5 flex items-center gap-2.5">
          {assignee && (
            <div className="flex items-center gap-1.5">
              <Avatar name={assignee.name} size={18} />
              <span className="text-[11px] text-[#555]">{assignee.name}</span>
            </div>
          )}
          {item.due_date && (
            <span
              className={`flex items-center gap-1 text-[11px] ${
                isOverdue ? "text-[#E24B4A]" : "text-[#444]"
              }`}
            >
              {isOverdue && <AlertCircle size={10} strokeWidth={2} />}
              {format(new Date(item.due_date), "dd MMM", { locale: ptBR })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function InlineActionItemForm({
  meetingId,
  projectId,
  users,
}: {
  meetingId: string;
  projectId: string | null;
  users: User[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createActionItem({
        meeting_id: meetingId,
        project_id: projectId,
        title: fd.get("title") as string,
        assignee_id: fd.get("assignee_id") as string,
        due_date: fd.get("due_date") as string,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Action item criado");
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-[11px] text-[#555] transition-colors hover:text-[#888]"
      >
        <Plus size={12} strokeWidth={1.5} />
        Novo action item
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-4"
    >
      <div className="flex flex-col gap-3">
        <input
          name="title"
          required
          placeholder="Descrição do action item"
          disabled={isPending}
          className={inputClass}
          autoFocus
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            name="assignee_id"
            required
            disabled={isPending}
            className={`${inputClass} appearance-none`}
          >
            <option value="">Responsável</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <input
            name="due_date"
            type="date"
            disabled={isPending}
            className={inputClass}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="rounded-lg px-3 py-1.5 text-[11px] text-[#555] transition-colors hover:text-[#888]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg bg-[#E24B4A] px-4 py-1.5 text-[11px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] disabled:opacity-70"
          >
            {isPending && <Loader2 size={12} className="animate-spin" />}
            Criar
          </button>
        </div>
      </div>
    </form>
  );
}

function ActionItemsSection({
  actionItems,
  meetingId,
  projectId,
  users,
  canEdit,
}: {
  actionItems: ActionItem[];
  meetingId: string;
  projectId: string | null;
  users: User[];
  canEdit: boolean;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>Action Items</SectionLabel>
        {canEdit && (
          <span className="text-[11px] text-[#333]">
            {actionItems.filter((a) => a.status === "done").length}/
            {actionItems.length} concluídos
          </span>
        )}
      </div>

      {actionItems.length === 0 && !canEdit ? (
        <p className="py-6 text-center text-[12px] text-[#333]">
          Nenhum action item
        </p>
      ) : (
        <div className="space-y-2">
          {actionItems.map((item) => (
            <ActionItemRow
              key={item.id}
              item={item}
              meetingId={meetingId}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      {canEdit && (
        <div className="mt-3">
          <InlineActionItemForm
            meetingId={meetingId}
            projectId={projectId}
            users={users}
          />
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────

export function MeetingView({
  meeting,
  decisions,
  actionItems,
  users,
  projects,
}: {
  meeting: Meeting;
  decisions: Decision[];
  actionItems: ActionItem[];
  users: User[];
  projects: Project[];
}) {
  const router = useRouter();
  const { isAdmin, isOperator } = useRole();
  const canEdit = isAdmin || isOperator;
  const [isPending, startTransition] = useTransition();

  const project = resolve(meeting.project);
  const typeCfg = typeConfig[meeting.type] ?? typeConfig.adhoc;
  const statusCfg = statusConfig[meeting.status] ?? statusConfig.scheduled;

  const dateStr = format(
    new Date(meeting.scheduled_at),
    "EEEE, d 'de' MMMM 'de' yyyy · HH:mm",
    { locale: ptBR }
  );

  const initialNotes = meeting.notes || meeting.description || "";

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      const result = await updateMeetingStatus(meeting.id, newStatus);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const labels: Record<string, string> = {
        in_progress: "Reunião iniciada",
        completed: "Reunião concluída",
        cancelled: "Reunião cancelada",
      };
      toast.success(labels[newStatus] ?? "Status atualizado");
      router.refresh();
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-[12px]">
        <Link
          href="/meetings"
          className="font-medium text-[#444] transition-colors hover:text-[#888]"
        >
          Reuniões
        </Link>
        <span className="text-[#333]">/</span>
        <span className="max-w-[240px] truncate font-medium text-[#ccc]">
          {meeting.title}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {/* Type badge + Title */}
          <div className="flex items-center gap-2.5">
            <Badge label={typeCfg.label} color={typeCfg.color} />
            <h1 className="font-display text-[22px] font-semibold text-white">
              {meeting.title}
            </h1>
            <Badge label={statusCfg.label} color={statusCfg.color} />
          </div>

          {/* Date */}
          <p className="mt-1.5 text-[13px] capitalize text-[#555]">
            {dateStr}
          </p>

          {/* Participants */}
          <div className="mt-3 flex items-center gap-1.5">
            {meeting.meeting_participants.map((p) => {
              const u = resolve(p.user);
              if (!u) return null;
              return (
                <div key={u.id} className="group relative">
                  <Avatar name={u.name} size={28} />
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1A1A1A] px-2 py-1 text-[10px] text-[#ccc] opacity-0 transition-opacity group-hover:opacity-100">
                    {u.name}
                  </div>
                </div>
              );
            })}
            {project && (
              <span className="ml-2 inline-flex rounded border border-[#1A1A1A] bg-[#0F0F0F] px-2 py-0.5 text-[10px] font-medium text-[#555]">
                {project.name}
              </span>
            )}
          </div>
        </div>

        {/* Right actions */}
        <RoleGate allowed={["admin", "operator"]}>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-[#222] bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc]"
                >
                  {isPending && (
                    <Loader2 size={12} className="animate-spin" />
                  )}
                  Ações
                  <ChevronDown size={12} strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {meeting.status === "scheduled" && (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("in_progress")}
                  >
                    <Circle
                      size={13}
                      className="mr-2 text-[#3B82F6]"
                      strokeWidth={1.5}
                    />
                    Iniciar reunião
                  </DropdownMenuItem>
                )}
                {(meeting.status === "scheduled" ||
                  meeting.status === "in_progress") && (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("completed")}
                  >
                    <CheckCircle2
                      size={13}
                      className="mr-2 text-[#10B981]"
                      strokeWidth={1.5}
                    />
                    Concluir
                  </DropdownMenuItem>
                )}
                {meeting.status !== "cancelled" &&
                  meeting.status !== "completed" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleStatusChange("cancelled")}
                        className="text-[#888] focus:text-[#E24B4A]"
                      >
                        <MoreHorizontal
                          size={13}
                          className="mr-2"
                          strokeWidth={1.5}
                        />
                        Cancelar reunião
                      </DropdownMenuItem>
                    </>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </RoleGate>
      </div>

      {/* Sections */}
      <div className="mt-8 space-y-10">
        <NotesSection
          meetingId={meeting.id}
          initialNotes={initialNotes}
          canEdit={canEdit}
          updatedAt={meeting.updated_at}
        />

        <DecisionsSection
          decisions={decisions}
          meetingId={meeting.id}
          projectId={meeting.project_id}
          participants={meeting.meeting_participants}
          projects={projects}
          canEdit={canEdit}
        />

        <ActionItemsSection
          actionItems={actionItems}
          meetingId={meeting.id}
          projectId={meeting.project_id}
          users={users}
          canEdit={canEdit}
        />
      </div>
    </motion.div>
  );
}
