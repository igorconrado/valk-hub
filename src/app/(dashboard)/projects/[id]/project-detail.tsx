"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow, format, parseISO, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { syncLinearCycles } from "../actions";
import {
  Pencil,
  Link as LinkIcon,
  CheckCircle,
  FileText,
  BookOpen,
  Code,
  Lightbulb,
  FileCheck,
  Layout,
  BarChart3,
  PenLine,
  Scale,
  Clock,
  UserPlus,
  Plus,
  List,
  Kanban,
  X,
} from "lucide-react";
import { CreateTaskDialog } from "@/app/(dashboard)/tasks/create-task-dialog";
import { TaskListView } from "@/app/(dashboard)/tasks/task-list-view";
import { TaskKanbanView } from "@/app/(dashboard)/tasks/task-kanban-view";
import { TaskDetailPanel } from "@/app/(dashboard)/tasks/task-detail-panel";
import { RoleGate } from "@/components/role-gate";
import { CreateDocumentDialog } from "@/app/(dashboard)/docs/create-document-dialog";
import { MetricsTab } from "./metrics-tab";
import { EditProjectDialog } from "./edit-project-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";
import { AddMemberDialog } from "./add-member-dialog";
import { ProjectLogo } from "@/components/project-logo";

type Project = {
  id: string;
  name: string;
  description: string | null;
  phase: string;
  status: string;
  thesis_type: string | null;
  thesis_hypothesis: string | null;
  launch_target: string | null;
  logo_url: string | null;
  created_at: string;
  owner: { id: string; name: string } | null;
};

type Member = {
  role_in_project: string;
  user: { id: string; name: string; company_role: string | null } | null;
};

const phaseStyles: Record<string, { bg: string; text: string; border: string }> = {
  discovery: { bg: "rgba(59,130,246,0.06)", text: "#5B9BF0", border: "rgba(59,130,246,0.12)" },
  mvp: { bg: "rgba(245,158,11,0.06)", text: "#E8A840", border: "rgba(245,158,11,0.12)" },
  validation: { bg: "rgba(139,92,246,0.06)", text: "#A07EF0", border: "rgba(139,92,246,0.12)" },
  traction: { bg: "rgba(16,185,129,0.06)", text: "#3DC9A0", border: "rgba(16,185,129,0.12)" },
  scale: { bg: "rgba(226,75,74,0.06)", text: "#E86B6A", border: "rgba(226,75,74,0.12)" },
  paused: { bg: "rgba(107,114,128,0.06)", text: "#888", border: "rgba(107,114,128,0.12)" },
  closed: { bg: "rgba(55,65,81,0.06)", text: "#666", border: "rgba(55,65,81,0.12)" },
};

const phaseLabels: Record<string, string> = {
  discovery: "Discovery",
  mvp: "MVP",
  validation: "Validação",
  traction: "Tração",
  scale: "Escala",
  paused: "Pausado",
  closed: "Encerrado",
};

const tabs = [
  { id: "sprint", label: "Sprint", icon: LinkIcon, placeholder: "Linear conecta na Sprint 2" },
  { id: "tasks", label: "Tasks", icon: CheckCircle, placeholder: "Sprint 2 traz as tasks" },
  { id: "docs", label: "Docs", icon: FileText, placeholder: "Docs chegam na Sprint 2" },
  { id: "metrics", label: "Métricas", icon: BarChart3, placeholder: "Sem números ainda", sub: "Lança, mede, aprende" },
  { id: "decisions", label: "Decisões", icon: Scale, placeholder: "Decisões entram na Sprint 2" },
  { id: "history", label: "Histórico", icon: Clock, placeholder: "Histórico começa na primeira sprint" },
];

function Avatar({ name, size = 26 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[9px] font-semibold text-[#555]"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

type AvailableUser = {
  id: string;
  name: string;
  company_role: string | null;
};

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

const STATUS_SUMMARY = [
  { key: "backlog", label: "backlog" },
  { key: "doing", label: "doing" },
  { key: "on_hold", label: "on hold" },
  { key: "review", label: "review" },
  { key: "done", label: "done" },
];

const SPRINT_STATUS_ORDER: Record<string, number> = {
  doing: 0,
  review: 1,
  on_hold: 2,
  backlog: 3,
  done: 4,
  cancelled: 5,
};

function SprintTabContent({
  linearConfig,
  activeCycle,
  tasks,
  statusColors,
  statusLabels,
}: {
  linearConfig: LinearSyncConfig;
  activeCycle: LinearCycle;
  tasks: TaskRow[];
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
}) {
  // No Linear connected
  if (!linearConfig) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center py-12">
        <LinkIcon size={28} strokeWidth={1.2} className="text-[#1A1A1A]" />
        <p className="mt-3 text-[13px] text-[#444]">
          Conecte o Linear nas configuracoes do produto
        </p>
      </div>
    );
  }

  // No active cycle
  if (!activeCycle || !activeCycle.starts_at || !activeCycle.ends_at) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center py-12">
        <LinkIcon size={28} strokeWidth={1.2} className="text-[#1A1A1A]" />
        <p className="mt-3 text-[13px] text-[#444]">
          Nenhuma sprint ativa no Linear.
        </p>
        <p className="mt-1 text-[11px] text-[#333]">
          Crie um cycle no Linear pra comecar.
        </p>
      </div>
    );
  }

  // Filter tasks within cycle period
  const cycleStart = parseISO(activeCycle.starts_at);
  const cycleEnd = parseISO(activeCycle.ends_at);

  const sprintTasks = tasks
    .filter((t) => {
      if (t.status === "cancelled") return false;
      // Include tasks created within the cycle period
      const created = parseISO(t.created_at);
      return isWithinInterval(created, { start: cycleStart, end: cycleEnd });
    })
    .sort(
      (a, b) =>
        (SPRINT_STATUS_ORDER[a.status] ?? 5) -
        (SPRINT_STATUS_ORDER[b.status] ?? 5)
    );

  const doneCount = sprintTasks.filter((t) => t.status === "done").length;
  const doingCount = sprintTasks.filter((t) => t.status === "doing").length;
  const blockedCount = sprintTasks.filter(
    (t) => t.status === "on_hold"
  ).length;
  const remainingCount = sprintTasks.filter(
    (t) => t.status === "backlog" || t.status === "review"
  ).length;
  const totalCount = sprintTasks.length;
  const progressPct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  const sprintLabel =
    activeCycle.name ?? `Sprint ${activeCycle.number ?? ""}`;
  const dateRange = `${format(cycleStart, "dd MMM", { locale: ptBR })} — ${format(cycleEnd, "dd MMM", { locale: ptBR })}`;

  return (
    <div className="py-5">
      {/* Header */}
      <div>
        <h2 className="font-display text-[18px] font-semibold text-[#eee]">
          {sprintLabel}
        </h2>
        <p className="mt-0.5 text-[12px] text-[#555]">{dateRange}</p>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#141414]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background:
                  progressPct === 100
                    ? "#10B981"
                    : "linear-gradient(90deg, #E24B4A, #10B981)",
              }}
            />
          </div>
          <span className="ml-3 shrink-0 text-[11px] text-[#666]">
            {doneCount} de {totalCount} tasks
          </span>
        </div>
      </div>

      {/* Task list */}
      {sprintTasks.length > 0 && (
        <div className="mt-5">
          {sprintTasks.map((task) => {
            const sColor = statusColors[task.status] ?? "#444";
            const pColor =
              task.priority === "urgent"
                ? "#E24B4A"
                : task.priority === "high"
                  ? "#F59E0B"
                  : task.priority === "medium"
                    ? "#3B82F6"
                    : "#444";
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
                key={task.id}
                className="flex items-center gap-3 border-b border-[#0F0F0F] px-1 py-2.5 transition-colors duration-150 hover:bg-white/[0.02]"
              >
                <span
                  className="inline-flex shrink-0 rounded-full px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${sColor}12`,
                    color: sColor,
                    border: `1px solid ${sColor}20`,
                  }}
                >
                  {statusLabels[task.status] ?? task.status}
                </span>
                <span className="flex-1 truncate text-[13px] font-medium text-[#ddd]">
                  {task.title}
                </span>
                {initials && (
                  <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#1A1A1A] text-[8px] font-semibold text-[#555]">
                    {initials}
                  </div>
                )}
                <div
                  className="h-[6px] w-[6px] shrink-0 rounded-full"
                  style={{ backgroundColor: pColor }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-[10px] border border-[#141414] bg-[#0A0A0A] p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#444]">
            Concluidas
          </span>
          <p className="mt-1 font-display text-[20px] font-semibold text-[#10B981]">
            {doneCount}
          </p>
        </div>
        <div className="rounded-[10px] border border-[#141414] bg-[#0A0A0A] p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#444]">
            Em andamento
          </span>
          <p className="mt-1 font-display text-[20px] font-semibold text-[#3B82F6]">
            {doingCount}
          </p>
        </div>
        <div className="rounded-[10px] border border-[#141414] bg-[#0A0A0A] p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#444]">
            Bloqueadas
          </span>
          <p className="mt-1 font-display text-[20px] font-semibold text-[#F59E0B]">
            {blockedCount}
          </p>
        </div>
        <div className="rounded-[10px] border border-[#141414] bg-[#0A0A0A] p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#444]">
            Restantes
          </span>
          <p className="mt-1 font-display text-[20px] font-semibold text-[#888]">
            {remainingCount}
          </p>
        </div>
      </div>
    </div>
  );
}

type LinearSyncConfig = {
  team_id: string;
  team_name: string;
  sync_enabled: boolean;
} | null;

type LinearCycle = {
  linear_cycle_id: string;
  project_id: string;
  linear_team_id: string;
  name: string | null;
  number: number | null;
  starts_at: string | null;
  ends_at: string | null;
} | null;

type DocRow = {
  id: string;
  title: string;
  type: string;
  version: number;
  created_by: string;
  updated_at: string;
  author: { id: string; name: string } | null;
};

const docTypeIcons: Record<string, { icon: typeof FileText; color: string }> = {
  contexto: { icon: FileText, color: "#5B9BF0" },
  prd: { icon: BookOpen, color: "#A07EF0" },
  spec: { icon: Code, color: "#3DC9A0" },
  aprendizado: { icon: Lightbulb, color: "#E8A840" },
  ata: { icon: FileCheck, color: "#888" },
  template: { icon: Layout, color: "#666" },
  relatorio: { icon: BarChart3, color: "#E86B6A" },
  livre: { icon: PenLine, color: "#555" },
};

export function ProjectDetail({
  project,
  members,
  availableUsers,
  tasks,
  allUsers,
  linearConfig,
  activeCycle,
  docs,
  metricsSnapshots,
}: {
  project: Project;
  members: Member[];
  availableUsers: AvailableUser[];
  tasks: TaskRow[];
  allUsers: { id: string; name: string }[];
  linearConfig: LinearSyncConfig;
  activeCycle: LinearCycle;
  docs: DocRow[];
  metricsSnapshots: {
    id: string;
    date: string;
    data_json: Record<string, number | null>;
    source: string;
    created_by: string;
  }[];
}) {
  const [activeTab, setActiveTab] = useState("sprint");
  const [taskView, setTaskView] = useState<"list" | "kanban">("list");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const cycleSynced = useRef(false);

  // Sync cycles from Linear when Sprint tab is first activated
  useEffect(() => {
    if (activeTab === "sprint" && linearConfig && !cycleSynced.current) {
      cycleSynced.current = true;
      syncLinearCycles(project.id);
    }
  }, [activeTab, linearConfig, project.id]);

  const timeAgo = formatDistanceToNow(new Date(project.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const phase = phaseStyles[project.phase] ?? phaseStyles.paused;
  const activeTabData = tabs.find((t) => t.id === activeTab)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-[12px]">
        <Link
          href="/projects"
          className="font-medium text-[#444] transition-colors hover:text-[#888]"
        >
          Produtos
        </Link>
        <span className="text-[#333]">/</span>
        <span className="font-medium text-[#ccc]">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <ProjectLogo name={project.name} logoUrl={project.logo_url} size={56} fontSize={22} />
          <div>
            <h1 className="font-display text-[24px] font-semibold tracking-tight text-[#eee]">
              {project.name}
            </h1>

          <div className="mt-2.5 flex items-center gap-2 text-[12px]">
            <span
              className="inline-flex rounded px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: phase.bg,
                color: phase.text,
                border: `1px solid ${phase.border}`,
              }}
            >
              {phaseLabels[project.phase] ?? project.phase}
            </span>

            {project.thesis_type && (
              <span className="inline-flex rounded border border-[#1A1A1A] bg-[#0F0F0F] px-2 py-0.5 text-[10px] font-medium text-[#555]">
                {project.thesis_type.toUpperCase()}
              </span>
            )}

            {project.owner && (
              <>
                <span className="text-[#222]">·</span>
                <span className="text-[#555]">
                  por {project.owner.name}
                </span>
              </>
            )}

            <span className="text-[#222]">·</span>
            <span className="text-[#444]">{timeAgo}</span>
          </div>
          </div>
        </div>

        <RoleGate allowed={["admin", "operator"]}>
          <EditProjectDialog project={project} linearConfig={linearConfig}>
            <button className="flex items-center gap-1.5 rounded-lg border border-[#1F1F1F] bg-transparent px-3 py-1.5 text-[12px] text-[#666] transition-all duration-150 hover:border-[#2A2A2A] hover:bg-white/[0.02] hover:text-[#ccc]">
              <Pencil size={13} strokeWidth={1.5} />
              Editar
            </button>
          </EditProjectDialog>
        </RoleGate>
      </div>

      {/* Hypothesis */}
      {project.thesis_hypothesis && (
        <div className="mt-4 rounded-[10px] border border-[#141414] bg-[#0A0A0A] p-3.5">
          <p className="text-[13px] italic text-[#777]">
            &ldquo;{project.thesis_hypothesis}&rdquo;
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-7 border-b border-[#141414]">
        <div className="-mb-px overflow-x-auto pr-5 [-ms-overflow-style:none] [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden md:overflow-x-visible md:pr-0">
          <div className="flex min-w-max gap-0.5 md:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap px-3.5 py-2.5 text-[12px] font-medium transition-colors duration-150 ${
                  activeTab === tab.id
                    ? "text-[#eee]"
                    : "text-[#444] hover:text-[#888]"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E24B4A]"
                    layoutId="tab-underline"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "sprint" ? (
        <SprintTabContent
          linearConfig={linearConfig}
          activeCycle={activeCycle}
          tasks={tasks}
          statusColors={statusColors}
          statusLabels={statusLabels}
        />
      ) : activeTab === "tasks" ? (
        <div className="py-5">
          {/* Summary bar */}
          {tasks.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {STATUS_SUMMARY.map(({ key, label }) => {
                const count = tasks.filter((t) => t.status === key).length;
                if (count === 0) return null;
                const color = statusColors[key] ?? "#444";
                return (
                  <span
                    key={key}
                    className="text-[11px] font-medium"
                    style={{ color }}
                  >
                    {count} {label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Header with view toggle + create button */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#444]">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-0.5 rounded-lg border border-[#1A1A1A] p-0.5">
                <button
                  onClick={() => setTaskView("list")}
                  className={`rounded-md p-1 transition-colors duration-150 ${
                    taskView === "list"
                      ? "bg-white/[0.06] text-[#ccc]"
                      : "text-[#444] hover:text-[#666]"
                  }`}
                >
                  <List size={12} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setTaskView("kanban")}
                  className={`rounded-md p-1 transition-colors duration-150 ${
                    taskView === "kanban"
                      ? "bg-white/[0.06] text-[#ccc]"
                      : "text-[#444] hover:text-[#666]"
                  }`}
                >
                  <Kanban size={12} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <RoleGate allowed={["admin", "operator"]}>
              <CreateTaskDialog
                defaultProjectId={project.id}
                projects={[{ id: project.id, name: project.name }]}
                users={allUsers}
              >
                <button className="flex items-center gap-1 rounded-lg border border-[#222] bg-transparent px-2.5 py-1 text-[11px] font-medium text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc]">
                  <Plus size={12} strokeWidth={1.5} />
                  Nova task
                </button>
              </CreateTaskDialog>
            </RoleGate>
          </div>

          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle
                size={28}
                strokeWidth={1.2}
                className="text-[#1A1A1A]"
              />
              <p className="mt-3 text-[13px] text-[#444]">
                Sem tasks nesse produto ainda.
              </p>
            </div>
          ) : taskView === "list" ? (
            <TaskListView
              tasks={tasks}
              users={allUsers}
              onTaskClick={setSelectedTaskId}
            />
          ) : (
            <TaskKanbanView
              tasks={tasks}
              users={allUsers}
              onTaskClick={setSelectedTaskId}
            />
          )}

          <TaskDetailPanel
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
          />
        </div>
      ) : activeTab === "metrics" ? (
        <MetricsTab projectId={project.id} snapshots={metricsSnapshots} />
      ) : activeTab === "docs" ? (
        <div className="py-5">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#555]">
              {docs.length} documento{docs.length !== 1 ? "s" : ""}
            </span>
            <RoleGate allowed={["admin", "operator"]}>
              <CreateDocumentDialog defaultProjectId={project.id}>
                <button className="flex items-center gap-1 rounded-lg border border-[#222] bg-transparent px-2.5 py-1 text-[11px] font-medium text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc]">
                  <Plus size={12} strokeWidth={1.5} />
                  Novo doc
                </button>
              </CreateDocumentDialog>
            </RoleGate>
          </div>

          {docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText
                size={28}
                strokeWidth={1.2}
                className="text-[#1A1A1A]"
              />
              <p className="mt-3 text-[13px] text-[#444]">
                Nenhum documento nesse produto ainda.
              </p>
            </div>
          ) : (
            <div>
              {docs.map((doc) => {
                const timeAgo = formatDistanceToNow(
                  new Date(doc.updated_at),
                  { addSuffix: true, locale: ptBR }
                );
                const typeConfig = docTypeIcons[doc.type] ?? {
                  icon: FileText,
                  color: "#555",
                };
                const TypeIcon = typeConfig.icon;

                return (
                  <Link
                    key={doc.id}
                    href={`/docs/${doc.id}`}
                    className="flex items-center gap-4 border-b border-[#0F0F0F] py-3.5 transition-colors duration-150 hover:bg-white/[0.02]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#141414] bg-[#0A0A0A]">
                      <TypeIcon
                        size={18}
                        strokeWidth={1.5}
                        style={{ color: typeConfig.color }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-[#ddd]">
                        {doc.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                        <span className="text-[#444]">
                          por {doc.author?.name ?? "Desconhecido"}
                        </span>
                        <span className="text-[#222]">·</span>
                        <span className="text-[#333]">
                          editado {timeAgo}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-[#444]">
                      v{doc.version}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-[200px] flex-col items-center justify-center py-12">
          <activeTabData.icon
            size={28}
            strokeWidth={1.2}
            className="text-[#1A1A1A]"
          />
          <p className="mt-3 text-[13px] text-[#444]">
            {activeTabData.placeholder}
          </p>
          {"sub" in activeTabData && activeTabData.sub && (
            <p className="mt-1 text-[11px] text-[#333]">
              {activeTabData.sub}
            </p>
          )}
        </div>
      )}

      {/* Members */}
      <div className="mt-9">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#444]">
          Time
        </h3>

        <div className="mt-3 flex flex-col gap-1">
          {members.map((member) => {
            if (!member.user) return null;

            return (
              <div
                key={member.user.id}
                className="group flex items-center gap-2.5 rounded-lg px-1 py-1.5 transition-colors hover:bg-white/[0.02]"
              >
                <Avatar name={member.user.name} />
                <span className="text-[13px] text-[#ccc]">
                  {member.user.name}
                </span>
                <span className="rounded border border-[#1A1A1A] bg-[#0F0F0F] px-1.5 py-px text-[10px] text-[#555]">
                  {member.role_in_project}
                </span>
                <RoleGate allowed={["admin", "operator"]}>
                  <RemoveMemberDialog
                    projectId={project.id}
                    projectName={project.name}
                    userId={member.user.id}
                    memberName={member.user.name}
                  >
                    <button className="ml-auto hidden text-[#333] transition-colors hover:text-[#E24B4A] group-hover:block">
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </RemoveMemberDialog>
                </RoleGate>
              </div>
            );
          })}
        </div>

        <RoleGate allowed={["admin", "operator"]}>
          <AddMemberDialog projectId={project.id} availableUsers={availableUsers}>
            <button className="mt-3 flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-[12px] text-[#444] transition-colors hover:text-[#888]">
              <UserPlus size={14} strokeWidth={1.5} />
              Adicionar ao time
            </button>
          </AddMemberDialog>
        </RoleGate>
      </div>
    </motion.div>
  );
}
