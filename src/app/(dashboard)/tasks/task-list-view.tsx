"use client";

import { motion } from "framer-motion";
import { isPast, parseISO, format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

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

const statusColors: Record<string, string> = {
  backlog: "#444",
  doing: "#3B82F6",
  on_hold: "#F59E0B",
  review: "#8B5CF6",
  done: "#10B981",
  cancelled: "#666",
};

const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  doing: "Doing",
  on_hold: "On Hold",
  review: "Review",
  done: "Done",
  cancelled: "Cancelled",
};

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

function PriorityDot({ priority }: { priority: string }) {
  return (
    <div
      className="h-[7px] w-[7px] shrink-0 rounded-full"
      style={{ backgroundColor: priorityColors[priority] ?? "#444" }}
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] ?? "#444";
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: `${color}12`,
        color: color,
        border: `1px solid ${color}20`,
      }}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-[#1A1A1A] bg-[#0F0F0F] px-2 py-0.5 text-[9px] font-medium text-[#555]">
      {typeLabels[type] ?? type}
    </span>
  );
}

function AssigneeAvatar({
  assignee,
  size = 22,
}: {
  assignee: { name: string; avatar_url: string | null } | null;
  size?: number;
}) {
  if (!assignee) return <div style={{ width: size, height: size }} />;

  const initials = assignee.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[9px] font-semibold text-[#555]"
      style={{ width: size, height: size }}
      title={assignee.name}
    >
      {initials}
    </div>
  );
}

function DueDate({ date }: { date: string | null }) {
  if (!date) return <span className="w-[60px]" />;

  const parsed = parseISO(date);
  const overdue = isPast(parsed) && !isToday(parsed);
  const formatted = format(parsed, "dd MMM", { locale: ptBR });

  return (
    <span
      className={`w-[60px] text-right text-[11px] ${
        overdue ? "font-medium text-[#E24B4A]" : "text-[#444]"
      }`}
    >
      {formatted}
    </span>
  );
}

export function TaskListView({
  tasks,
  onTaskClick,
}: {
  tasks: TaskRow[];
  users: { id: string; name: string }[];
  onTaskClick?: (taskId: string) => void;
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#0F0F0F] px-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#333]">
        <div className="w-5" />
        <div className="w-3" />
        <div className="flex-1">Titulo</div>
        <div className="w-[56px]">Tipo</div>
        <div className="w-[100px]">Produto</div>
        <div className="w-[22px]" />
        <div className="w-[60px] text-right">Prazo</div>
        <div className="w-[72px] text-right">Status</div>
      </div>

      {/* Rows */}
      {tasks.map((task, i) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.03 }}
          className="group flex items-center gap-3 border-b border-[#0F0F0F] px-1 py-3 transition-colors duration-150 hover:bg-white/[0.02]"
        >
          {/* Checkbox */}
          <div className="flex w-5 items-center justify-center">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-[#222] bg-transparent accent-[#E24B4A]"
            />
          </div>

          {/* Priority */}
          <div className="flex w-3 items-center justify-center">
            <PriorityDot priority={task.priority} />
          </div>

          {/* Title */}
          <button
            onClick={() => onTaskClick?.(task.id)}
            className="flex-1 truncate text-left text-[13px] font-medium text-[#ddd] transition-colors duration-150 group-hover:text-white"
          >
            {task.title}
          </button>

          {/* Type */}
          <div className="w-[56px]">
            <TypeBadge type={task.type} />
          </div>

          {/* Product */}
          <div className="w-[100px] truncate text-[11px] text-[#555]">
            {task.project?.name ?? "Empresa"}
          </div>

          {/* Assignee */}
          <AssigneeAvatar assignee={task.assignee} size={22} />

          {/* Due Date */}
          <DueDate date={task.due_date} />

          {/* Status */}
          <div className="flex w-[72px] justify-end">
            <StatusBadge status={task.status} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
