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
  ValkDialog,
  ValkDropdown,
  Avatar,
  ValkInput,
  ValkTextarea,
  ValkSelect,
  type ValkSelectOption,
} from "@/components/ds";
import { useTranslations } from "next-intl";
import { RoleGate } from "@/components/role-gate";
import { useRole } from "@/lib/hooks/use-role";
import { DocumentEditor } from "@/components/editor/document-editor";
import { MarkdownBlock } from "@/components/markdown/MarkdownBlock";
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
  date: string | null;
  scheduled_at?: string | null;
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

function makeAvatarUser(name: string) {
  return {
    name,
    initials: name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
    color: "#555",
  };
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

const impactOptions: ValkSelectOption[] = [
  { value: "low", label: "Baixo" },
  { value: "medium", label: "Médio" },
  { value: "high", label: "Alto" },
  { value: "critical", label: "Crítico" },
];

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="eyebrow">
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
        <span suppressHydrationWarning className="flex items-center gap-1 text-[11px] text-[#333]">
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
      {/* If content looks like markdown (no HTML tags), render with MarkdownBlock.
          Otherwise use TipTap editor for HTML content. */}
      {!canEdit && notes && !notes.includes("<p>") && !notes.includes("<h") ? (
        <MarkdownBlock content={notes} />
      ) : (
        <DocumentEditor
          content={notes}
          onChange={handleChange}
          editable={canEdit}
          placeholder="Registre a pauta e anotações da reunião..."
        />
      )}
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
  const t = useTranslations();
  const [selectedDeciders, setSelectedDeciders] = useState<string[]>([]);
  const [impact, setImpact] = useState("medium");
  const [decTitle, setDecTitle] = useState("");
  const [decProjectId, setDecProjectId] = useState(projectId ?? "");

  function toggleDecider(id: string) {
    setSelectedDeciders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const projectOptions: ValkSelectOption[] = [
    { value: "", label: t("common.none") },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const result = await createDecision({
        meeting_id: meetingId,
        project_id: decProjectId || projectId || "",
        title: decTitle,
        impact,
        decided_by_ids: selectedDeciders,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Decisão registrada");
      setOpen(false);
      setSelectedDeciders([]);
      setDecTitle("");
      setImpact("medium");
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
        title={t("dialogs.registerDecision")}
        subtitle="Documente uma decisao tomada nesta reuniao"
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
              form="create-meeting-decision-form"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Registrar
            </button>
          </>
        }
      >
        <form id="create-meeting-decision-form" onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          {/* Descricao */}
          <div>
            <label className="label">Descricao</label>
            <ValkTextarea
              name="title"
              required
              rows={3}
              value={decTitle}
              onChange={(e) => setDecTitle(e.target.value)}
              placeholder="O que foi decidido?"
              disabled={isPending}
            />
          </div>

          {/* Impacto */}
          <div>
            <label className="label">Impacto</label>
            <ValkSelect
              value={impact}
              onValueChange={setImpact}
              options={impactOptions}
              disabled={isPending}
            />
          </div>

          {/* Quem decidiu */}
          <div>
            <label className="label">Quem decidiu</label>
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
                    <Avatar user={makeAvatarUser(u.name)} size={24} />
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
            <label className="label">Produto</label>
            <ValkSelect
              value={decProjectId}
              onValueChange={setDecProjectId}
              options={projectOptions}
              disabled={isPending}
            />
          </div>
        </form>
      </ValkDialog>
    </>
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
                      <Avatar user={makeAvatarUser(decider.name)} size={20} />
                      <span className="text-[11px] text-[#555]">
                        {decider.name}
                      </span>
                    </div>
                  )}
                  {d.decided_at && (
                    <span suppressHydrationWarning className="text-[11px] text-[#333]">
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
              <Avatar user={makeAvatarUser(assignee.name)} size={18} />
              <span className="text-[11px] text-[#555]">{assignee.name}</span>
            </div>
          )}
          {item.due_date && (
            <span
              suppressHydrationWarning
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
  const t = useTranslations();
  const [itemTitle, setItemTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const assigneeOptions: ValkSelectOption[] = [
    { value: "", label: t("fields.assignee") },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const result = await createActionItem({
        meeting_id: meetingId,
        project_id: projectId,
        title: itemTitle,
        assignee_id: assigneeId,
        due_date: dueDate,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Action item criado");
      setOpen(false);
      setItemTitle("");
      setAssigneeId("");
      setDueDate("");
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
        <ValkInput
          name="title"
          required
          value={itemTitle}
          onChange={(e) => setItemTitle(e.target.value)}
          placeholder={t("fields.description")}
          disabled={isPending}
          autoFocus
        />
        <div className="grid grid-cols-2 gap-3">
          <ValkSelect
            value={assigneeId}
            onValueChange={setAssigneeId}
            options={assigneeOptions}
            disabled={isPending}
            name="assignee_id"
          />
          <ValkInput
            name="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isPending}
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
  const t = useTranslations();
  const { isAdmin, isOperator } = useRole();
  const canEdit = isAdmin || isOperator;
  const [isPending, startTransition] = useTransition();

  const project = resolve(meeting.project);
  const typeCfg = typeConfig[meeting.type] ?? typeConfig.adhoc;
  const statusCfg = statusConfig[meeting.status] ?? statusConfig.scheduled;

  const rawDate = meeting.date ?? meeting.scheduled_at;
  const parsedDate = rawDate ? new Date(rawDate) : null;
  const dateStr = parsedDate && !isNaN(parsedDate.getTime())
    ? format(parsedDate, "EEEE, d 'de' MMMM 'de' yyyy · HH:mm", { locale: ptBR })
    : "Data não disponível";

  // Prefer notes_md (markdown) over notes (HTML/TipTap) over description
  const m = meeting as Record<string, unknown>;
  const initialNotes =
    (m.notes_md as string) || meeting.notes || meeting.description || "";

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

  // Build dropdown sections dynamically based on meeting status
  const dropdownSections = (() => {
    const mainItems: { label: string; icon: React.ReactNode; onClick: () => void }[] = [];

    if (meeting.status === "scheduled") {
      mainItems.push({
        label: "Iniciar reunião",
        icon: <Circle size={13} className="text-[#3B82F6]" strokeWidth={1.5} />,
        onClick: () => handleStatusChange("in_progress"),
      });
    }

    if (meeting.status === "scheduled" || meeting.status === "in_progress") {
      mainItems.push({
        label: "Concluir",
        icon: <CheckCircle2 size={13} className="text-[#10B981]" strokeWidth={1.5} />,
        onClick: () => handleStatusChange("completed"),
      });
    }

    const sections: { items: { label: string; icon: React.ReactNode; onClick: () => void; destructive?: boolean }[] }[] = [];

    if (mainItems.length > 0) {
      sections.push({ items: mainItems });
    }

    if (meeting.status !== "cancelled" && meeting.status !== "completed") {
      sections.push({
        items: [
          {
            label: t("dialogs.cancelMeeting"),
            icon: <MoreHorizontal size={13} strokeWidth={1.5} />,
            onClick: () => handleStatusChange("cancelled"),
            destructive: true,
          },
        ],
      });
    }

    return sections;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Breadcrumb removed — top bar owns it */}

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
          <p suppressHydrationWarning className="mt-1.5 text-[13px] capitalize text-[#555]">
            {dateStr}
          </p>

          {/* Participants */}
          <div className="mt-3 flex items-center gap-1.5">
            {meeting.meeting_participants.map((p) => {
              const u = resolve(p.user);
              if (!u) return null;
              return (
                <div key={u.id} className="group relative">
                  <Avatar user={makeAvatarUser(u.name)} size={28} />
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
          {dropdownSections.length > 0 && (
            <div className="flex items-center gap-2">
              <ValkDropdown
                trigger={
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
                }
                sections={dropdownSections}
              />
            </div>
          )}
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
