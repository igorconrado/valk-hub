"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow, format, parseISO, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil } from "lucide-react";
import { RoleGate } from "@/components/role-gate";
import { useRole } from "@/lib/hooks/use-role";
import { ProjectLogo } from "@/components/project-logo";
import { EditProfileDialog } from "./edit-profile-dialog";

// ── Types ──────────────────────────────────────────────

type Person = {
  id: string;
  name: string;
  email: string;
  role: string;
  company_role: string | null;
  avatar_url: string | null;
  dedication: string | null;
  bio: string | null;
  responsibilities: string | null;
};

type ProjectMembership = {
  id: string;
  name: string;
  phase: string;
  status: string;
  logo_url: string | null;
  role_in_project: string;
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  due_date: string | null;
  project: { id: string; name: string } | { id: string; name: string }[] | null;
};

type Activity = {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, string> | null;
  created_at: string;
};

// ── Config ─────────────────────────────────────────────

const roleConfig: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "#E24B4A" },
  operator: { label: "Operator", color: "#3B82F6" },
  stakeholder: { label: "Stakeholder", color: "#888" },
};

const dedicationConfig: Record<string, { label: string; color: string }> = {
  full_time: { label: "Full-time", color: "#10B981" },
  partial: { label: "Parcial", color: "#F59E0B" },
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
  discovery: "Discovery", mvp: "MVP", validation: "Validação",
  traction: "Tração", scale: "Escala", paused: "Pausado", closed: "Encerrado",
};

const statusColors: Record<string, string> = {
  backlog: "#444", doing: "#3B82F6", on_hold: "#F59E0B",
  review: "#8B5CF6", done: "#10B981", cancelled: "#666",
};

const statusLabels: Record<string, string> = {
  backlog: "Backlog", doing: "Doing", on_hold: "On Hold",
  review: "Review", done: "Done", cancelled: "Cancelled",
};

const priorityColors: Record<string, string> = {
  urgent: "#E24B4A", high: "#F59E0B", medium: "#3B82F6", low: "#444",
};

// ── Helpers ────────────────────────────────────────────

function resolve<T>(val: T | T[] | null): T | null {
  if (val == null) return null;
  if (Array.isArray(val)) return val[0] ?? null;
  return val;
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex rounded px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: `${color}14`,
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
    <h2 className="text-[10px] font-semibold uppercase tracking-wider text-[#333]">
      {children}
    </h2>
  );
}

function getActionText(action: string, metadata: Record<string, string> | null): React.ReactNode {
  const projectName = metadata?.project_name || metadata?.name;
  const taskTitle = metadata?.task_title;
  const reason = metadata?.reason;

  switch (action) {
    case "created_project":
    case "project_created":
      return <>criou o projeto <span className="text-[#ccc]">{projectName}</span></>;
    case "updated_project":
      return <>atualizou o projeto <span className="text-[#ccc]">{projectName}</span></>;
    case "added_member":
      return <>adicionou <span className="text-[#ccc]">{metadata?.member_name}</span> ao projeto</>;
    case "removed_member":
      return <>removeu <span className="text-[#ccc]">{metadata?.member_name}</span> do projeto</>;
    case "created_task":
      return <>criou a task <span className="text-[#ccc]">{taskTitle}</span></>;
    case "task_updated":
      return <>atualizou <span className="text-[#ccc]">{metadata?.field ?? "task"}</span></>;
    case "task_status_changed":
      return <>moveu task para <span className="text-[#ccc]">{metadata?.status}</span></>;
    case "blocked_task":
      return <>bloqueou task{reason && <>: <span className="text-[#ccc]">{reason}</span></>}</>;
    case "unblocked_task":
      return "desbloqueou task";
    case "created_meeting":
      return <>agendou <span className="text-[#ccc]">{metadata?.title}</span></>;
    case "meeting_status_changed":
      return <>atualizou reunião para <span className="text-[#ccc]">{metadata?.status}</span></>;
    case "created_decision":
      return <>registrou decisão <span className="text-[#ccc]">{metadata?.title}</span></>;
    case "created_action_item":
      return <>criou action item <span className="text-[#ccc]">{metadata?.title}</span></>;
    case "created_report":
      return <>gerou relatório <span className="text-[#ccc]">{metadata?.title}</span></>;
    case "published_report":
      return "publicou relatório";
    case "created_document":
      return "criou um documento";
    default:
      return action.replace(/_/g, " ");
  }
}

// ── Sections ───────────────────────────────────────────

function ProjectsSection({ projects }: { projects: ProjectMembership[] }) {
  if (projects.length === 0) {
    return (
      <div>
        <SectionLabel>Projetos</SectionLabel>
        <p className="mt-3 text-[12px] text-[#444]">Sem projetos vinculados</p>
      </div>
    );
  }

  return (
    <div>
      <SectionLabel>Projetos</SectionLabel>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {projects.map((p) => {
          const phase = phaseStyles[p.phase] ?? phaseStyles.paused;
          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="flex items-center gap-3 rounded-xl border border-[#141414] bg-[#0A0A0A] px-4 py-3 transition-all duration-[250ms] hover:-translate-y-px hover:border-[#1F1F1F]"
            >
              <ProjectLogo name={p.name} logoUrl={p.logo_url} size={32} fontSize={13} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[#ddd]">
                  {p.name}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className="inline-flex rounded px-1.5 py-px text-[9px] font-medium"
                    style={{
                      backgroundColor: phase.bg,
                      color: phase.text,
                      border: `1px solid ${phase.border}`,
                    }}
                  >
                    {phaseLabels[p.phase] ?? p.phase}
                  </span>
                  <span className="text-[10px] text-[#444]">
                    {p.role_in_project}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function TasksSection({ tasks, personId }: { tasks: Task[]; personId: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <SectionLabel>Tasks ativas</SectionLabel>
        {tasks.length > 0 && (
          <span className="text-[11px] text-[#333]">{tasks.length} pendentes</span>
        )}
      </div>

      {tasks.length === 0 ? (
        <p className="mt-3 text-[12px] text-[#444]">Nenhuma task ativa</p>
      ) : (
        <>
          <div className="mt-3 flex flex-col">
            {tasks.map((task) => {
              const project = resolve(task.project);
              const overdue =
                task.due_date &&
                isPast(parseISO(task.due_date)) &&
                !isToday(parseISO(task.due_date));

              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 border-b border-[#0F0F0F] py-2.5 text-[12px]"
                >
                  <div
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{
                      backgroundColor: priorityColors[task.priority] ?? "#444",
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[#ddd]">
                    {task.title}
                  </span>
                  {project && (
                    <span className="shrink-0 text-[11px] text-[#444]">
                      {project.name}
                    </span>
                  )}
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${statusColors[task.status] ?? "#444"}12`,
                      color: statusColors[task.status] ?? "#444",
                      border: `1px solid ${statusColors[task.status] ?? "#444"}20`,
                    }}
                  >
                    {statusLabels[task.status] ?? task.status}
                  </span>
                  {task.due_date && (
                    <span
                      className={`w-[50px] shrink-0 text-right text-[11px] ${
                        overdue ? "font-medium text-[#E24B4A]" : "text-[#444]"
                      }`}
                    >
                      {format(parseISO(task.due_date), "dd MMM", {
                        locale: ptBR,
                      })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <Link
            href={`/tasks?assignee=${personId}`}
            className="mt-2 inline-block text-[10px] text-[#555] transition-colors hover:text-[#E24B4A]"
          >
            Ver todas →
          </Link>
        </>
      )}
    </div>
  );
}

function ActivitySection({ activities }: { activities: Activity[] }) {
  return (
    <div>
      <SectionLabel>Atividade</SectionLabel>

      {activities.length === 0 ? (
        <p className="mt-3 text-[12px] text-[#444]">Nenhuma atividade registrada</p>
      ) : (
        <div className="mt-3">
          {activities.map((activity, i) => {
            const timeAgo = formatDistanceToNow(new Date(activity.created_at), {
              addSuffix: true,
              locale: ptBR,
            });

            return (
              <div key={activity.id}>
                {i > 0 && <div className="h-px bg-[#0F0F0F]" />}
                <div className="flex items-center gap-2.5 py-2.5">
                  <p className="min-w-0 flex-1 truncate text-[13px] text-[#888]">
                    {getActionText(activity.action, activity.metadata)}
                  </p>
                  <span className="shrink-0 text-[11px] text-[#333]">
                    {timeAgo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────

export function PersonView({
  person,
  currentUserId,
  projects,
  tasks,
  activities,
}: {
  person: Person;
  currentUserId: string | null;
  projects: ProjectMembership[];
  tasks: Task[];
  activities: Activity[];
}) {
  const roleCfg = roleConfig[person.role] ?? roleConfig.stakeholder;
  const dedCfg = person.dedication
    ? dedicationConfig[person.dedication]
    : null;

  const { isAdmin } = useRole();
  const isOwnProfile = currentUserId === person.id;

  const initials = person.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-[12px]">
        <Link
          href="/people"
          className="font-medium text-[#444] transition-colors hover:text-[#888]"
        >
          People
        </Link>
        <span className="text-[#333]">/</span>
        <span className="max-w-[200px] truncate font-medium text-[#ccc]">
          {person.name}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {person.avatar_url ? (
            <img
              src={person.avatar_url}
              alt={person.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1A1A1A]">
              <span className="font-display text-[24px] font-semibold text-[#555]">
                {initials}
              </span>
            </div>
          )}

          <div>
            <h1 className="font-display text-[24px] font-semibold text-white">
              {person.name}
            </h1>
            {person.company_role && (
              <p className="mt-0.5 text-[14px] text-[#666]">
                {person.company_role}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Badge label={roleCfg.label} color={roleCfg.color} />
              {dedCfg && <Badge label={dedCfg.label} color={dedCfg.color} />}
            </div>
            <p className="mt-2 font-mono text-[12px] text-[#555]">
              {person.email}
            </p>
          </div>
        </div>

        {/* Edit button */}
        {isOwnProfile ? (
          <EditProfileDialog person={person} isAdmin={isAdmin}>
            <button className="flex items-center gap-1.5 rounded-lg border border-[#222] bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc]">
              <Pencil size={13} strokeWidth={1.5} />
              Editar perfil
            </button>
          </EditProfileDialog>
        ) : (
          <RoleGate allowed={["admin"]}>
            <EditProfileDialog person={person} isAdmin={isAdmin}>
              <button className="flex items-center gap-1.5 rounded-lg border border-[#222] bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc]">
                <Pencil size={13} strokeWidth={1.5} />
                Editar perfil
              </button>
            </EditProfileDialog>
          </RoleGate>
        )}
      </div>

      {/* Sections */}
      <div className="mt-8 space-y-10">
        <ProjectsSection projects={projects} />
        <TasksSection tasks={tasks} personId={person.id} />
        <ActivitySection activities={activities} />
      </div>
    </motion.div>
  );
}
