"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  User,
  Zap,
  AlertCircle,
  Clock,
  Layers,
  Star,
  CheckSquare,
  Filter,
  Calendar,
  Target,
  Flag,
  Bookmark,
  Eye,
  Folder,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskView, ViewFilters } from "@/types/task-view";
import { applyViewFilters } from "@/lib/task-views/apply-filters";
import { ValkDialog, ValkInput, ValkSelect } from "@/components/ds";
import {
  createTaskView,
  updateTaskView,
  deleteTaskView,
} from "@/app/(dashboard)/tasks/views/actions";
import { toast } from "sonner";

/* ─── Icon resolver ─── */

const ICON_MAP: Record<string, typeof User> = {
  User, Zap, AlertCircle, Clock, Layers, Star, CheckSquare, Filter,
  Calendar, Target, Flag, Bookmark, Eye, Folder,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

function ViewIcon({ name, className }: { name: string | null; className?: string }) {
  if (!name) return null;
  if (name.length <= 2) return <span className={cn("text-sm", className)}>{name}</span>;
  const Icon = ICON_MAP[name];
  return Icon ? <Icon className={cn("w-3.5 h-3.5", className)} strokeWidth={1.5} /> : null;
}

/* ─── ViewChip ─── */

function ViewChip({
  view,
  count,
  isActive,
  onClick,
}: {
  view: TaskView;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm transition-fast shrink-0",
        isActive
          ? "bg-white/[0.06] text-white border border-[var(--border-default)]"
          : "text-[var(--text-muted)] hover:text-white hover:bg-white/[0.03] border border-transparent"
      )}
    >
      <ViewIcon name={view.icon} />
      <span>{view.name}</span>
      <span className="text-[11px] text-[var(--text-faint)] num">{count}</span>
    </button>
  );
}

/* ─── CreateViewDialog ─── */

function CreateViewDialog({
  open,
  editingView,
  canCreateWorkspace,
  currentFilters,
  onClose,
  onSaved,
}: {
  open: boolean;
  editingView: TaskView | null;
  canCreateWorkspace: boolean;
  currentFilters: ViewFilters;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = !!editingView;
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Filter");
  const [scope, setScope] = useState<"personal" | "workspace">("personal");
  const [saving, setSaving] = useState(false);

  // Reset form when opened
  useMemo(() => {
    if (open) {
      if (editingView) {
        setName(editingView.name);
        setIcon(editingView.icon ?? "Filter");
        setScope(editingView.scope === "workspace" ? "workspace" : "personal");
      } else {
        setName("");
        setIcon("Filter");
        setScope("personal");
      }
    }
  }, [open, editingView]);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Dê um nome à view");
      return;
    }
    setSaving(true);
    const filters = editingView?.filters ?? currentFilters;

    const result = isEditing
      ? await updateTaskView(editingView!.id, { name, icon, filters })
      : await createTaskView({ name, icon, scope, filters });

    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? "View atualizada" : "View criada");
    onSaved();
  }

  async function handleDelete() {
    if (!editingView) return;
    setSaving(true);
    const result = await deleteTaskView(editingView.id);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("View deletada");
    onSaved();
  }

  return (
    <ValkDialog
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar view" : "Nova view"}
      footer={
        <div className="flex items-center justify-between w-full">
          {isEditing ? (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="text-[12px] text-[var(--danger)] hover:underline disabled:opacity-50"
            >
              Deletar
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-lg px-4 py-2.5 text-[12px] text-[#555] hover:text-[#888]"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn primary"
            >
              {isEditing ? "Salvar" : "Criar view"}
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="label">Nome</label>
          <ValkInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Minhas prioritarias"
            autoFocus
          />
        </div>

        <div>
          <label className="label">Icone</label>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {ICON_OPTIONS.map((opt) => {
              const Icon = ICON_MAP[opt];
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setIcon(opt)}
                  className={cn(
                    "flex items-center justify-center rounded-lg p-2 transition-fast",
                    icon === opt
                      ? "bg-white/[0.06] text-white border border-[var(--border-default)]"
                      : "text-[var(--text-muted)] hover:bg-white/[0.03] hover:text-white border border-transparent"
                  )}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </button>
              );
            })}
          </div>
        </div>

        {!isEditing && (
          <div>
            <label className="label">Visibilidade</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-[13px] text-white">
                <input
                  type="radio"
                  checked={scope === "personal"}
                  onChange={() => setScope("personal")}
                  className="accent-[var(--primary)]"
                />
                Só eu (pessoal)
              </label>
              <label
                className={cn(
                  "flex items-center gap-2 text-[13px]",
                  canCreateWorkspace ? "cursor-pointer text-white" : "opacity-50 cursor-not-allowed text-[#888]"
                )}
              >
                <input
                  type="radio"
                  checked={scope === "workspace"}
                  onChange={() => canCreateWorkspace && setScope("workspace")}
                  disabled={!canCreateWorkspace}
                  className="accent-[var(--primary)]"
                />
                Todo o workspace
                {!canCreateWorkspace && (
                  <span className="text-[10px] text-[var(--text-faint)]">(só admin)</span>
                )}
              </label>
            </div>
          </div>
        )}
      </div>
    </ValkDialog>
  );
}

/* ─── ViewBar ─── */

interface ViewBarProps {
  views: TaskView[];
  tasks: { project_id: string | null; sprint_id?: string | null; assignee_id: string; status: string; priority: string; type: string; due_date: string | null; title: string }[];
  activeViewId: string | null;
  activeSprintIds: string[];
  currentUserId: string;
  currentUserIsAdmin: boolean;
  currentFilters: ViewFilters;
  onSelectView: (view: TaskView) => void;
  onRefresh: () => void;
}

export function ViewBar({
  views,
  tasks,
  activeViewId,
  activeSprintIds,
  currentUserId,
  currentUserIsAdmin,
  currentFilters,
  onSelectView,
  onRefresh,
}: ViewBarProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingView, setEditingView] = useState<TaskView | null>(null);

  const viewsWithCounts = useMemo(
    () =>
      views.map((v) => ({
        ...v,
        count: applyViewFilters(tasks, v.filters, { currentUserId, activeSprintIds }).length,
      })),
    [views, tasks, currentUserId, activeSprintIds]
  );

  const systemViews = viewsWithCounts.filter((v) => v.scope === "system");
  const workspaceViews = viewsWithCounts.filter((v) => v.scope === "workspace");
  const personalViews = viewsWithCounts.filter((v) => v.scope === "personal");

  return (
    <>
      <div className="flex items-center gap-1 overflow-x-auto pb-3" style={{ marginBottom: 8 }}>
        {systemViews.map((v) => (
          <ViewChip
            key={v.id}
            view={v}
            count={v.count}
            isActive={v.id === activeViewId}
            onClick={() => onSelectView(v)}
          />
        ))}

        {workspaceViews.length > 0 && (
          <>
            <div className="mx-1 h-4 w-px shrink-0 bg-[var(--border-default)]" />
            {workspaceViews.map((v) => (
              <ViewChip
                key={v.id}
                view={v}
                count={v.count}
                isActive={v.id === activeViewId}
                onClick={() => onSelectView(v)}
              />
            ))}
          </>
        )}

        {personalViews.length > 0 && (
          <>
            <div className="mx-1 h-4 w-px shrink-0 bg-[var(--border-default)]" />
            {personalViews.map((v) => (
              <ViewChip
                key={v.id}
                view={v}
                count={v.count}
                isActive={v.id === activeViewId}
                onClick={() => onSelectView(v)}
              />
            ))}
          </>
        )}

        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm text-[var(--text-muted)] hover:text-white hover:bg-white/[0.03] transition-fast shrink-0"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          Nova view
        </button>
      </div>

      <CreateViewDialog
        open={dialogOpen || !!editingView}
        editingView={editingView}
        canCreateWorkspace={currentUserIsAdmin}
        currentFilters={currentFilters}
        onClose={() => {
          setDialogOpen(false);
          setEditingView(null);
        }}
        onSaved={() => {
          onRefresh();
          setDialogOpen(false);
          setEditingView(null);
        }}
      />
    </>
  );
}
