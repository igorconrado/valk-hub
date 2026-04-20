"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Circle,
  Flag,
  User,
  CircleDot,
  MessageSquare,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ds";
import { TYPE_COLORS } from "@/lib/task-colors";
import { getInitials } from "@/lib/color-hash";
import { PriorityChip } from "./PriorityChip";
import { SprintBadge } from "./SprintBadge";

interface TaskCardProps {
  task: {
    id: string;
    display_id: string;
    title: string;
    type: string;
    priority: string;
    status: string;
    due_date: string | null;
    ready_to_advance: boolean;
    linear_issue_id: string | null;
    assignee: { id: string; name: string; avatar_url: string | null } | null;
    project: { name: string; task_prefix: string } | null;
    subtasks_count?: { total: number; done: number };
    comments_count?: number;
    attachments_count?: number;
    sprint?: { id: string; number: number; name: string; status: string } | null;
  };
  onClick: () => void;
  showSprintBadge?: boolean;
}

export function TaskCard({ task, onClick, showSprintBadge = true }: TaskCardProps) {
  const tTypes = useTranslations("tasks.types");
  const tKanban = useTranslations("kanban");

  const typeColor = TYPE_COLORS[task.type] ?? { bg: "rgba(107,114,128,0.12)", text: "#9CA3AF" };

  const typeKeys = ["dev", "task", "meeting_prep", "report", "research", "decision", "growth", "design", "ops"];
  const typeLabel = typeKeys.includes(task.type)
    ? tTypes(task.type as keyof IntlMessages["tasks"]["types"])
    : task.type;

  const showReadyBadge = task.ready_to_advance === true;
  const showToolbar = !showReadyBadge;

  const hasSubtasks = task.subtasks_count && task.subtasks_count.total > 0;
  const hasComments = task.comments_count && task.comments_count > 0;
  const hasAttachments = task.attachments_count && task.attachments_count > 0;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${task.display_id} ${task.title}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative cursor-pointer rounded-xl border border-[#141414] bg-[#0A0A0A] p-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#2A2A2A] hover:shadow-md"
    >
      {/* Ready badge */}
      {showReadyBadge && (
        <span
          className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
        >
          <span style={{ fontSize: 8 }}>●</span>
          {tKanban("readyToAdvance")}
        </span>
      )}

      {/* Hover toolbar */}
      {showToolbar && (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); console.log("todo: status menu"); }}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#555] transition-colors hover:text-[#888]"
          >
            <Circle size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); console.log("todo: priority menu"); }}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#555] transition-colors hover:text-[#888]"
          >
            <Flag size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); console.log("todo: assignee menu"); }}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#555] transition-colors hover:text-[#888]"
          >
            <User size={12} />
          </button>
        </div>
      )}

      {/* Top row */}
      <div className="flex items-center gap-2">
        <PriorityChip priority={task.priority} />
        {showSprintBadge && task.sprint && (
          <SprintBadge sprint={task.sprint} />
        )}
        <span
          className="font-mono text-[11px] text-[#555]"
          style={{ letterSpacing: "0.02em" }}
        >
          {task.display_id}
        </span>
        <span className="ml-auto" />
        {task.linear_issue_id && (
          <a
            href={`https://linear.app/issue/${task.linear_issue_id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 font-mono text-[11px] text-[#555] transition-colors hover:text-[#888]"
          >
            <ExternalLink size={10} strokeWidth={2} />
          </a>
        )}
      </div>

      {/* Title */}
      <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-tight text-[#DDD]">
        {task.title}
      </p>

      {/* Tags row */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span
          className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium"
          style={{ background: typeColor.bg, color: typeColor.text }}
        >
          {typeLabel}
        </span>
        {task.project ? (
          <span className="inline-flex items-center rounded-md border border-[#1F1F1F] bg-[#141414] px-2 py-0.5 text-[11px] text-[#888]">
            {task.project.name}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md border border-[#1F1F1F] bg-[#141414] px-2 py-0.5 text-[11px]" style={{ color: "rgba(226,75,74,0.4)" }}>
            VALK
          </span>
        )}
      </div>

      {/* Footer row */}
      <div className="mt-2 flex items-center gap-2">
        {/* Left: assignee */}
        {task.assignee ? (
          <Avatar
            user={{
              name: task.assignee.name,
              initials: getInitials(task.assignee.name),
              color: "#555",
              avatar_url: task.assignee.avatar_url,
            }}
            size={20}
          />
        ) : (
          <div className="h-5 w-5" />
        )}

        {/* Middle: indicators */}
        <div className="ml-auto flex items-center gap-2.5">
          {hasSubtasks && (
            <span className="flex items-center gap-1 font-mono text-[11px] text-[#555]">
              <CircleDot size={11} strokeWidth={1.5} />
              {task.subtasks_count!.done}/{task.subtasks_count!.total}
            </span>
          )}
          {hasComments && (
            <span className="flex items-center gap-1 font-mono text-[11px] text-[#555]">
              <MessageSquare size={11} strokeWidth={1.5} />
              {task.comments_count}
            </span>
          )}
          {hasAttachments && (
            <span className="flex items-center gap-1 font-mono text-[11px] text-[#555]">
              <Paperclip size={11} strokeWidth={1.5} />
              {task.attachments_count}
            </span>
          )}
          {task.due_date && (
            <span className="font-mono text-[10px] text-[#555]">
              {format(parseISO(task.due_date), "dd MMM", { locale: ptBR })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
