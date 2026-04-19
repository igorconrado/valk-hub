"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Check } from "lucide-react";
import { formatDistanceToNow, isPast, parseISO, format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRole } from "@/lib/hooks/use-role";
import { Avatar } from "@/components/ds";
import { getTaskDetail, updateTaskField, resolveTaskBlock } from "./actions";
import { BlockReasonDialog } from "./block-reason-dialog";
import { getActionText } from "@/lib/activity-text";

type TaskDetail = NonNullable<Awaited<ReturnType<typeof getTaskDetail>>>;

function useDetailLabels() {
  const tK = useTranslations("kanban");
  const tP = useTranslations("tasks.priorities");
  const tT = useTranslations("tasks.types");

  const statusOptions = [
    { value: "backlog", label: tK("backlog"), color: "#444" },
    { value: "doing", label: tK("doing"), color: "#3B82F6" },
    { value: "on_hold", label: tK("onHold"), color: "#F59E0B" },
    { value: "review", label: tK("review"), color: "#8B5CF6" },
    { value: "done", label: tK("done"), color: "#10B981" },
    { value: "cancelled", label: "Cancelled", color: "#666" },
  ];

  const priorityOptions = [
    { value: "low", label: tP("low"), color: "#444" },
    { value: "medium", label: tP("medium"), color: "#3B82F6" },
    { value: "high", label: tP("high"), color: "#F59E0B" },
    { value: "urgent", label: tP("urgent"), color: "#E24B4A" },
  ];

  const getTypeLabel = (type: string) => {
    const keys = ["dev", "task", "meeting_prep", "report", "research", "decision", "growth", "design", "ops"];
    return keys.includes(type) ? tT(type as keyof IntlMessages["tasks"]["types"]) : type;
  };

  return { statusOptions, priorityOptions, getTypeLabel };
}

function DropdownPill({
  options,
  value,
  onChange,
  canEdit,
}: {
  options: { value: string; label: string; color: string }[];
  value: string;
  onChange: (v: string) => void;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  const color = current?.color ?? "#444";

  return (
    <div className="relative">
      <button
        onClick={() => canEdit && setOpen(!open)}
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
          canEdit ? "cursor-pointer hover:brightness-125" : "cursor-default"
        }`}
        style={{
          backgroundColor: `${color}15`,
          color: color,
          border: `1px solid ${color}25`,
        }}
      >
        {current?.label ?? value}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-[61] mt-1 min-w-[130px] rounded-lg border border-[#1A1A1A] bg-[#111] p-1 shadow-xl">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition-colors hover:bg-white/[0.04] ${
                  opt.value === value ? "text-white" : "text-[#888]"
                }`}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
                {opt.label}
                {opt.value === value && (
                  <Check size={10} className="ml-auto text-[#E24B4A]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function InlineSelect({
  label,
  value,
  displayValue,
  options,
  onChange,
  canEdit,
}: {
  label: string;
  value: string;
  displayValue: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[11px] text-[#444]">{label}</span>
      <div className="relative">
        <button
          onClick={() => canEdit && setOpen(!open)}
          className={`text-[12px] text-[#ccc] transition-colors ${
            canEdit ? "hover:text-white" : ""
          }`}
        >
          {displayValue}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-[61] mt-1 max-h-[200px] min-w-[160px] overflow-y-auto rounded-lg border border-[#1A1A1A] bg-[#111] p-1 shadow-xl">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[11px] transition-colors hover:bg-white/[0.04] ${
                    opt.value === value ? "text-white" : "text-[#888]"
                  }`}
                >
                  {opt.label}
                  {opt.value === value && (
                    <Check size={10} className="text-[#E24B4A]" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}



export function TaskDetailPanel({
  taskId,
  onClose,
}: {
  taskId: string | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState("");
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const { isAdmin, isOperator } = useRole();
  const canEdit = isAdmin || isOperator;
  const t = useTranslations();
  const tc = useTranslations("common");
  const { statusOptions, priorityOptions, getTypeLabel } = useDetailLabels();

  const fetchData = useCallback(async (id: string) => {
    setLoading(true);
    const result = await getTaskDetail(id);
    setData(result);
    if (result) {
      setTitleValue(result.task.title);
      setDescValue(result.task.description ?? "");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (taskId) {
      fetchData(taskId);
    } else {
      setData(null);
    }
  }, [taskId, fetchData]);

  function handleFieldUpdate(field: string, value: string | string[] | null) {
    if (!taskId) return;
    startTransition(async () => {
      const result = await updateTaskField(taskId, field, value);
      if (result.error) {
        toast.error(result.error);
      } else {
        await fetchData(taskId);
      }
    });
  }

  function handleStatusChange(newStatus: string) {
    if (newStatus === "on_hold") {
      setBlockDialogOpen(true);
      return;
    }
    handleFieldUpdate("status", newStatus);
  }

  function handleBlockComplete() {
    setBlockDialogOpen(false);
    if (taskId) fetchData(taskId);
  }

  function handleTitleSave() {
    if (titleValue.trim() && titleValue !== data?.task.title) {
      handleFieldUpdate("title", titleValue.trim());
    }
    setEditingTitle(false);
  }

  function handleDescSave() {
    if (descValue !== (data?.task.description ?? "")) {
      handleFieldUpdate("description", descValue || null);
    }
    setEditingDesc(false);
  }

  function handleResolveBlock(blockId: string) {
    startTransition(async () => {
      const result = await resolveTaskBlock(blockId);
      if (result.error) {
        toast.error(result.error);
      } else if (taskId) {
        await fetchData(taskId);
      }
    });
  }

  const task = data?.task;
  const blocks = data?.blocks ?? [];
  const activities = data?.activities ?? [];
  const projects = data?.projects ?? [];
  const users = data?.users ?? [];

  const assigneeOptions = users.map((u) => ({ value: u.id, label: u.name }));
  const projectOptions = [
    { value: "", label: "Empresa (sem produto)" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <>
    <AnimatePresence>
      {taskId && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col sm:w-[480px]"
            style={{
              background: "var(--bg-1)",
              borderLeft: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-panel)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            {loading || !task ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#333] border-t-[#E24B4A]" />
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <div className="shrink-0 px-6 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {editingTitle && canEdit ? (
                        <input
                          autoFocus
                          value={titleValue}
                          onChange={(e) => setTitleValue(e.target.value)}
                          onBlur={handleTitleSave}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleTitleSave();
                            if (e.key === "Escape") {
                              setTitleValue(task.title);
                              setEditingTitle(false);
                            }
                          }}
                          className="w-full border-b border-[#E24B4A] bg-transparent font-display text-[18px] font-semibold text-[#eee] outline-none"
                        />
                      ) : (
                        <h2
                          onClick={() => canEdit && setEditingTitle(true)}
                          className={`font-display text-[18px] font-semibold leading-snug text-[#eee] ${
                            canEdit
                              ? "cursor-text rounded-md transition-colors hover:bg-white/[0.03]"
                              : ""
                          }`}
                        >
                          {task.title}
                        </h2>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="shrink-0 rounded-md p-1 text-[#444] transition-colors hover:bg-white/[0.04] hover:text-[#888]"
                    >
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Metadata pills */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <DropdownPill
                      options={statusOptions}
                      value={task.status}
                      onChange={handleStatusChange}
                      canEdit={canEdit}
                    />
                    <DropdownPill
                      options={priorityOptions}
                      value={task.priority}
                      onChange={(v) => handleFieldUpdate("priority", v)}
                      canEdit={canEdit}
                    />
                    <span className="inline-flex items-center rounded-full border border-[#1A1A1A] bg-[#0F0F0F] px-2 py-0.5 text-[10px] font-medium text-[#555]">
                      {getTypeLabel(task.type)}
                    </span>
                  </div>

                  <div className="mt-5 h-px bg-[#141414]" />
                </div>

                {/* Details */}
                <div className="px-6 pt-4">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#333]">
                    Detalhes
                  </h3>
                  <div className="mt-2 flex flex-col">
                    <InlineSelect
                      label="Responsavel"
                      value={task.assignee_id}
                      displayValue={
                        task.assignee
                          ? task.assignee.name
                          : t("tasks.noAssignee")
                      }
                      options={assigneeOptions}
                      onChange={(v) => handleFieldUpdate("assignee_id", v)}
                      canEdit={canEdit}
                    />
                    <InlineSelect
                      label={t("fields.product")}
                      value={task.project_id ?? ""}
                      displayValue={task.project?.name ?? "Empresa"}
                      options={projectOptions}
                      onChange={(v) =>
                        handleFieldUpdate("project_id", v || null)
                      }
                      canEdit={canEdit}
                    />
                    <div className="flex items-center justify-between py-2">
                      <span className="text-[11px] text-[#444]">
                        Data limite
                      </span>
                      {canEdit ? (
                        <input
                          type="date"
                          value={task.due_date ?? ""}
                          onChange={(e) =>
                            handleFieldUpdate(
                              "due_date",
                              e.target.value || null
                            )
                          }
                          className={`border-none bg-transparent text-right text-[12px] outline-none ${
                            task.due_date &&
                            isPast(parseISO(task.due_date)) &&
                            !isToday(parseISO(task.due_date))
                              ? "text-[#E24B4A]"
                              : "text-[#ccc]"
                          }`}
                        />
                      ) : (
                        <span
                          className={`text-[12px] ${
                            task.due_date &&
                            isPast(parseISO(task.due_date)) &&
                            !isToday(parseISO(task.due_date))
                              ? "text-[#E24B4A]"
                              : "text-[#ccc]"
                          }`}
                        >
                          {task.due_date
                            ? format(parseISO(task.due_date), "dd MMM yyyy", {
                                locale: ptBR,
                              })
                            : "—"}
                        </span>
                      )}
                    </div>

                    {/* Linear link */}
                    {task.linear_issue_id && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-[11px] text-[#444]">Linear</span>
                        <a
                          href={`https://linear.app/issue/${task.linear_issue_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[12px] text-[#E24B4A] transition-colors hover:text-[#F06060]"
                        >
                          Ver no Linear
                          <ExternalLink size={10} strokeWidth={2} />
                        </a>
                      </div>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-start justify-between py-2">
                        <span className="text-[11px] text-[#444]">Tags</span>
                        <div className="flex flex-wrap justify-end gap-1">
                          {task.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="rounded-full border border-[#1A1A1A] bg-[#0F0F0F] px-2 py-px text-[10px] text-[#555]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 h-px bg-[#141414]" />
                </div>

                {/* Description */}
                <div className="px-6 pt-4">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#333]">
                    Descricao
                  </h3>
                  <div className="mt-2">
                    {editingDesc && canEdit ? (
                      <div>
                        <textarea
                          autoFocus
                          value={descValue}
                          onChange={(e) => setDescValue(e.target.value)}
                          rows={5}
                          className="w-full rounded-lg border border-[#1A1A1A] bg-[#050505] px-3 py-2 text-[13px] text-[#ddd] placeholder-[#333] outline-none transition-colors focus:border-[#E24B4A]"
                          placeholder="Descreva a task..."
                        />
                        <div className="mt-1.5 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setDescValue(task.description ?? "");
                              setEditingDesc(false);
                            }}
                            className="text-[11px] text-[#444] transition-colors hover:text-[#888]"
                          >
                            {tc("cancel")}
                          </button>
                          <button
                            onClick={handleDescSave}
                            className="rounded-md bg-[#E24B4A] px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#D4403F]"
                          >
                            {tc("save")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => canEdit && setEditingDesc(true)}
                        className={`min-h-[40px] rounded-md px-1 py-1 text-[13px] leading-relaxed ${
                          task.description
                            ? "whitespace-pre-wrap text-[#999]"
                            : "text-[#333] italic"
                        } ${
                          canEdit
                            ? "cursor-text transition-colors hover:bg-white/[0.02]"
                            : ""
                        }`}
                      >
                        {task.description || t("tasks.addDescription")}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 h-px bg-[#141414]" />
                </div>

                {/* Blocks (if on_hold) */}
                {task.status === "on_hold" && blocks.length > 0 && (
                  <div className="px-6 pt-4">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#333]">
                      Bloqueios
                    </h3>
                    <div className="mt-2 flex flex-col gap-2">
                      {blocks.map((block) => {
                        const createdBy = Array.isArray(block.created_by_user)
                          ? block.created_by_user[0]
                          : block.created_by_user;
                        const blockedBy = Array.isArray(block.blocked_by)
                          ? block.blocked_by[0]
                          : block.blocked_by;
                        const timeAgo = formatDistanceToNow(
                          new Date(block.created_at),
                          { addSuffix: true, locale: ptBR }
                        );

                        return (
                          <div
                            key={block.id}
                            className={`rounded-lg border p-3 ${
                              block.resolved
                                ? "border-[#111] bg-[#060606]"
                                : "border-[#F59E0B20] bg-[#F59E0B06]"
                            }`}
                          >
                            <p
                              className={`text-[12px] leading-relaxed ${
                                block.resolved
                                  ? "text-[#444] line-through"
                                  : "text-[#ccc]"
                              }`}
                            >
                              {block.reason}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#444]">
                              <span>
                                reportado por{" "}
                                {createdBy?.name ?? "desconhecido"}
                              </span>
                              <span>·</span>
                              <span suppressHydrationWarning>{timeAgo}</span>
                              {blockedBy?.name && (
                                <>
                                  <span>·</span>
                                  <span>
                                    destravar: {blockedBy.name}
                                  </span>
                                </>
                              )}
                            </div>
                            {!block.resolved && canEdit && (
                              <button
                                onClick={() => handleResolveBlock(block.id)}
                                disabled={isPending}
                                className="mt-2 rounded-md border border-[#10B98130] bg-[#10B98110] px-2.5 py-1 text-[10px] font-medium text-[#10B981] transition-colors hover:bg-[#10B98120] disabled:opacity-50"
                              >
                                Resolver
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 h-px bg-[#141414]" />
                  </div>
                )}

                {/* Activity */}
                <div className="px-6 pb-6 pt-4">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#333]">
                    Atividade
                  </h3>
                  {activities.length === 0 ? (
                    <p className="mt-3 text-[11px] text-[#333]">
                      Sem atividade registrada
                    </p>
                  ) : (
                    <div className="mt-2">
                      {activities.map((activity, i) => {
                        const activityUser = Array.isArray(activity.user)
                          ? activity.user[0]
                          : activity.user;
                        const timeAgo = formatDistanceToNow(
                          new Date(activity.created_at),
                          { addSuffix: true, locale: ptBR }
                        );
                        const initials = activityUser?.name
                          ? activityUser.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()
                          : "?";

                        return (
                          <div key={activity.id}>
                            {i > 0 && (
                              <div className="h-px bg-[#0F0F0F]" />
                            )}
                            <div className="flex items-center gap-2.5 py-2">
                              <Avatar
                                user={{
                                  name: activityUser?.name ?? "Desconhecido",
                                  initials,
                                  color: "#555",
                                }}
                                size={20}
                              />
                              <p className="min-w-0 flex-1 truncate text-[11px] text-[#666]">
                                <span className="font-medium text-[#888]">
                                  {activityUser?.name ?? "Desconhecido"}{" "}
                                </span>
                                {getActionText(
                                  activity.action,
                                  activity.metadata
                                )}
                              </p>
                              <span suppressHydrationWarning className="shrink-0 text-[10px] text-[#333]">
                                {timeAgo}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>

      {taskId && (
        <BlockReasonDialog
          open={blockDialogOpen}
          taskId={taskId}
          users={users}
          onClose={() => setBlockDialogOpen(false)}
          onComplete={handleBlockComplete}
        />
      )}
    </>
  );
}
