"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { isPast, parseISO, format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { updateTaskStatus } from "./actions";
import { BlockReasonDialog } from "./block-reason-dialog";

type TaskRow = {
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
  assignee: { id: string; name: string; avatar_url: string | null } | null;
  project: { id: string; name: string; logo_url: string | null } | null;
};

const COLUMNS = [
  { id: "backlog", label: "Backlog", color: "#444" },
  { id: "doing", label: "Doing", color: "#3B82F6" },
  { id: "on_hold", label: "On Hold", color: "#F59E0B" },
  { id: "review", label: "Review", color: "#8B5CF6" },
  { id: "done", label: "Done", color: "#10B981" },
];

const priorityColors: Record<string, string> = {
  urgent: "#E24B4A",
  high: "#F59E0B",
  medium: "#3B82F6",
  low: "#444",
};

const typeLabels: Record<string, string> = {
  dev: "Dev",
  task: "Task",
  meeting_prep: "Reuniao",
  report: "Report",
  research: "Pesquisa",
  decision: "Decisao",
};

function KanbanCard({ task, isDragging }: { task: TaskRow; isDragging?: boolean }) {
  const overdue =
    task.due_date &&
    isPast(parseISO(task.due_date)) &&
    !isToday(parseISO(task.due_date));

  const initials = task.assignee
    ? task.assignee.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <div
      className={`rounded-lg border border-[#141414] bg-[#0A0A0A] p-3 transition-all duration-150 ${
        isDragging
          ? "rotate-[2deg] shadow-xl shadow-black/40 ring-1 ring-[#E24B4A]/20"
          : "hover:border-[#1F1F1F]"
      }`}
    >
      <p className="text-[13px] font-medium leading-snug text-[#ddd]">
        {task.title}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <div
          className="h-[6px] w-[6px] shrink-0 rounded-full"
          style={{
            backgroundColor: priorityColors[task.priority] ?? "#444",
          }}
        />
        <span className="inline-flex items-center rounded-full border border-[#1A1A1A] bg-[#0F0F0F] px-1.5 py-px text-[9px] font-medium text-[#555]">
          {typeLabels[task.type] ?? task.type}
        </span>
        {initials && (
          <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1A1A1A] text-[8px] font-semibold text-[#555]">
            {initials}
          </div>
        )}
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[10px] text-[#444]">
          {task.project?.name ?? "Empresa"}
        </span>
        {task.due_date && (
          <span
            className={`text-[10px] ${
              overdue ? "font-medium text-[#E24B4A]" : "text-[#444]"
            }`}
          >
            {format(parseISO(task.due_date), "dd MMM", { locale: ptBR })}
          </span>
        )}
      </div>
    </div>
  );
}

function SortableCard({ task }: { task: TaskRow }) {
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
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard task={task} />
    </div>
  );
}

function DroppableColumn({
  column,
  tasks,
}: {
  column: (typeof COLUMNS)[number];
  tasks: TaskRow[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] w-[220px] shrink-0 flex-col rounded-xl transition-colors duration-150 lg:w-auto lg:flex-1 ${
        isOver ? "bg-white/[0.02]" : ""
      }`}
    >
      {/* Column header */}
      <div className="mb-3 flex items-center gap-2 px-1">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#666]">
          {column.label}
        </span>
        <span
          className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-semibold"
          style={{
            backgroundColor: `${column.color}15`,
            color: column.color,
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <SortableCard task={task} />
            </motion.div>
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function TaskKanbanView({
  tasks,
  users,
}: {
  tasks: TaskRow[];
  users: { id: string; name: string }[];
}) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [activeTask, setActiveTask] = useState<TaskRow | null>(null);
  const [blockDialog, setBlockDialog] = useState<{
    taskId: string;
    open: boolean;
  }>({ taskId: "", open: false });

  // Sync when parent tasks change (e.g. after revalidation)
  const tasksKey = tasks.map((t) => `${t.id}:${t.status}`).join(",");
  useState(() => {
    setLocalTasks(tasks);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as TaskRow | undefined;
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

      // Determine the target column
      let targetStatus: string | null = null;

      // If dropped on a column directly
      const columnIds = COLUMNS.map((c) => c.id);
      if (columnIds.includes(over.id as string)) {
        targetStatus = over.id as string;
      } else {
        // Dropped on another card — find that card's status
        const overTask = localTasks.find((t) => t.id === over.id);
        if (overTask) targetStatus = overTask.status;
      }

      if (!targetStatus || targetStatus === task.status) return;

      // If moving to "on_hold", show block reason dialog first
      if (targetStatus === "on_hold") {
        setBlockDialog({ taskId, open: true });
        return;
      }

      // Optimistic update
      setLocalTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
      );

      await updateTaskStatus(taskId, targetStatus);
    },
    [localTasks]
  );

  const handleBlockDialogComplete = useCallback(() => {
    setBlockDialog({ taskId: "", open: false });
    // The server action + revalidation handles the state update
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
        <div className="flex gap-3 overflow-x-auto pb-4 lg:gap-4">
          {grouped.map((col) => (
            <DroppableColumn
              key={col.id}
              column={col}
              tasks={col.tasks}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} isDragging /> : null}
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
