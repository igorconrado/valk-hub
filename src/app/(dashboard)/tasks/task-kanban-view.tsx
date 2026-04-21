"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { STATUS_COLORS } from "@/lib/task-colors";
import { TaskCard } from "@/components/tasks/TaskCard";
import { updateTaskStatus } from "./actions";
import { BlockReasonDialog } from "./block-reason-dialog";

export type KanbanTask = {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  type: string;
  assignee_id: string;
  status: string;
  priority: string;
  due_date: string | null;
  tags: string[];
  linear_issue_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  display_id?: string;
  ready_to_advance?: boolean | null;
  sprint_id?: string | null;
  assignee: { id: string; name: string; avatar_url: string | null } | null;
  project: { id: string; name: string; logo_url: string | null; task_prefix?: string } | null;
  subtasks_count?: { total: number; done: number };
  sprint?: { id: string; number: number; name: string; status: string } | null;
};

const COLUMN_DEFS = [
  { id: "backlog", key: "backlog" as const },
  { id: "doing", key: "doing" as const },
  { id: "on_hold", key: "onHold" as const },
  { id: "review", key: "review" as const },
  { id: "done", key: "done" as const },
];

/* ─── Adapt KanbanTask to TaskCard props ─── */
function toCardTask(task: KanbanTask) {
  return {
    id: task.id,
    display_id: task.display_id ?? task.id.slice(0, 7).toUpperCase(),
    title: task.title,
    type: task.type,
    priority: task.priority,
    status: task.status,
    due_date: task.due_date,
    ready_to_advance: task.ready_to_advance === true,
    linear_issue_id: task.linear_issue_id,
    assignee: task.assignee,
    project: task.project
      ? { name: task.project.name, task_prefix: task.project.task_prefix ?? "" }
      : null,
    subtasks_count: task.subtasks_count,
    sprint: task.sprint ?? undefined,
  };
}

/* ─── Sortable wrapper ─── */
function SortableCard({
  task,
  onTitleClick,
  showSprintBadge = true,
  isPending = false,
}: {
  task: KanbanTask;
  onTitleClick?: (taskId: string) => void;
  showSprintBadge?: boolean;
  isPending?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : isPending ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={toCardTask(task)}
        onClick={() => onTitleClick?.(task.id)}
        showSprintBadge={showSprintBadge}
      />
    </div>
  );
}

/* ─── Droppable column ─── */
function DroppableColumn({
  column,
  tasks,
  onTitleClick,
  showSprintBadge = true,
  pendingTaskId,
}: {
  column: { id: string; label: string };
  tasks: KanbanTask[];
  onTitleClick?: (taskId: string) => void;
  showSprintBadge?: boolean;
  pendingTaskId?: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const statusColor = STATUS_COLORS[column.id] ?? "#6B7280";

  return (
    <div
      ref={setNodeRef}
      className="flex w-[260px] shrink-0 flex-col rounded-xl border transition-colors duration-150 xl:flex-1"
      style={{
        background: isOver ? "rgba(255,255,255,0.015)" : "#0D0D0D",
        borderColor: isOver ? "var(--border-hover)" : "#1A1A1A",
        padding: 12,
        minHeight: "calc(100vh - 280px)",
      }}
    >
      {/* Column header */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: statusColor }}
        />
        <span className="eyebrow">
          {column.label}
        </span>
        <span className="ml-auto font-mono text-[11px] text-[#444] num">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {tasks.length === 0 && (
            <div
              className="rounded-lg border border-dashed p-6 text-center"
              style={{ borderColor: "var(--border-default)", color: "var(--text-faint)", fontSize: 12 }}
            >
              Arraste uma task aqui
            </div>
          )}
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <SortableCard task={task} onTitleClick={onTitleClick} showSprintBadge={showSprintBadge} isPending={pendingTaskId === task.id} />
            </motion.div>
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

/* ─── Kanban board ─── */
export function TaskKanbanView({
  tasks,
  users,
  onTaskClick,
  showSprintBadge = true,
}: {
  tasks: KanbanTask[];
  users: { id: string; name: string }[];
  onTaskClick?: (taskId: string) => void;
  showSprintBadge?: boolean;
}) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [blockDialog, setBlockDialog] = useState<{
    taskId: string;
    open: boolean;
  }>({ taskId: "", open: false });
  const tK = useTranslations("kanban");

  const COLUMNS = COLUMN_DEFS.map((c) => ({ ...c, label: tK(c.key) }));

  // Sync when parent tasks change (e.g. filter change, revalidation)
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as KanbanTask | undefined;
    if (task) setActiveTask(task);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const task = localTasks.find((t) => t.id === taskId);
      if (!task) return;

      let targetStatus: string | null = null;
      const columnIds = COLUMN_DEFS.map((c) => c.id);
      if (columnIds.includes(over.id as string)) {
        targetStatus = over.id as string;
      } else {
        const overTask = localTasks.find((t) => t.id === over.id);
        if (overTask) targetStatus = overTask.status;
      }

      if (!targetStatus || targetStatus === task.status) return;

      if (targetStatus === "on_hold") {
        setBlockDialog({ taskId, open: true });
        return;
      }

      const previousStatus = task.status;

      // Optimistic update
      setLocalTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
      );
      setPendingTaskId(taskId);

      const result = await updateTaskStatus(taskId, targetStatus);

      if (result.error) {
        // Rollback
        setLocalTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: previousStatus } : t))
        );
        toast.error("Falha ao mover task");
      }

      setPendingTaskId(null);
    },
    [localTasks]
  );

  const handleBlockDialogComplete = useCallback(() => {
    setBlockDialog({ taskId: "", open: false });
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === blockDialog.taskId ? { ...t, status: "on_hold" } : t
      )
    );
  }, [blockDialog.taskId]);

  const grouped = COLUMNS.map((col) => ({
    ...col,
    tasks: localTasks.filter((t) => t.status === col.id),
  }));

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="kanban-scroll flex gap-4 overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch]"
        >
          {grouped.map((col) => (
            <DroppableColumn
              key={col.id}
              column={col}
              tasks={col.tasks}
              onTitleClick={onTaskClick}
              showSprintBadge={showSprintBadge}
              pendingTaskId={pendingTaskId}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={toCardTask(activeTask)}
              onClick={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <BlockReasonDialog
        open={blockDialog.open}
        taskId={blockDialog.taskId}
        users={users}
        onClose={() => setBlockDialog({ taskId: "", open: false })}
        onComplete={handleBlockDialogComplete}
      />
    </>
  );
}
