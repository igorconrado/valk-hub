"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { List, Kanban, Plus, Filter, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { CreateTaskDialog } from "./create-task-dialog";
import { TaskListView } from "./task-list-view";
import { TaskKanbanView, type KanbanTask } from "./task-kanban-view";
import { TaskDetailDialog } from "@/components/tasks/TaskDetailDialog";
import { PageHeader } from "@/components/page-header";

type FilterProject = { id: string; name: string };
type FilterUser = { id: string; name: string };

function useFilterOptions() {
  const tK = useTranslations("kanban");
  const tT = useTranslations("tasks.types");
  const tP = useTranslations("tasks.priorities");
  const tF = useTranslations("tasks.filters");

  const STATUS_OPTIONS: [string, string][] = [
    ["all", tF("all")],
    ["backlog", tK("backlog")],
    ["doing", tK("doing")],
    ["on_hold", tK("onHold")],
    ["review", tK("review")],
    ["done", tK("done")],
  ];

  const TYPE_OPTIONS: [string, string][] = [
    ["all", tF("all")],
    ["dev", tT("dev")],
    ["task", tT("task")],
    ["meeting_prep", tT("meeting_prep")],
    ["research", tT("research")],
    ["decision", tT("decision")],
    ["report", tT("report")],
    ["growth", tT("growth")],
    ["design", tT("design")],
    ["ops", tT("ops")],
  ];

  const PRIORITY_OPTIONS: [string, string][] = [
    ["all", tF("all")],
    ["urgent", tP("urgent")],
    ["high", tP("high")],
    ["medium", tP("medium")],
    ["low", tP("low")],
  ];

  return { STATUS_OPTIONS, TYPE_OPTIONS, PRIORITY_OPTIONS };
}

/* ─── FilterPill ─── */
function FilterPill({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o[0] === value);
  const active = value !== "all";

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center font-sans"
        style={{
          gap: 6,
          padding: "5px 10px",
          fontSize: 11.5,
          fontWeight: 500,
          borderRadius: 6,
          border: "1px solid",
          borderColor: active ? "var(--primary-border)" : "var(--border-subtle)",
          background: active ? "var(--primary-bg)" : "transparent",
          color: active ? "var(--primary)" : "var(--text-muted)",
        }}
      >
        <span style={{ opacity: 0.7 }}>{label}:</span> {current?.[1] || "Todos"}
        <ChevronDown size={10} strokeWidth={2} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full z-20"
            style={{
              marginTop: 4,
              background: "var(--bg-elev)",
              border: "1px solid var(--border-default)",
              borderRadius: 8,
              padding: 4,
              minWidth: 160,
              maxHeight: 300,
              overflow: "auto",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {options.map(([k, v]) => (
              <button
                key={k}
                onClick={() => {
                  onChange(k);
                  setOpen(false);
                }}
                className="block w-full text-left font-sans"
                style={{
                  padding: "6px 10px",
                  fontSize: 12,
                  borderRadius: 5,
                  color: k === value ? "var(--text-primary)" : "var(--text-secondary)",
                  background: k === value ? "rgba(255,255,255,0.04)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (k !== value) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                }}
                onMouseLeave={(e) => {
                  if (k !== value) e.currentTarget.style.background = "transparent";
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Segmented Control ─── */
function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon: React.ReactNode }[];
}) {
  return (
    <div
      className="inline-flex"
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        padding: 2,
      }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="inline-flex items-center"
          style={{
            padding: "5px 11px",
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 6,
            transition: "all 150ms",
            color: value === o.value ? "var(--text-primary)" : "var(--text-muted)",
            background: value === o.value ? "rgba(255,255,255,0.05)" : "transparent",
            gap: 6,
          }}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

type Sprint = { id: string; number: number; name: string; status: string; project_id: string };

export function TasksContent({
  tasks,
  projects,
  users,
  sprints = [],
}: {
  tasks: KanbanTask[];
  projects: FilterProject[];
  users: FilterUser[];
  sprints?: Sprint[];
}) {
  const t = useTranslations("tasks");
  const tF = useTranslations("tasks.filters");
  const tS = useTranslations("sprints");
  const { STATUS_OPTIONS, TYPE_OPTIONS, PRIORITY_OPTIONS } = useFilterOptions();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState<"list" | "kanban">("list");

  // URL-backed filter state
  const filterProject = searchParams.get("product") ?? "all";
  const filterSprint = searchParams.get("sprint") ?? "all";
  const filterStatus = searchParams.get("status") ?? "all";
  const filterType = searchParams.get("type") ?? "all";
  const filterAssignee = searchParams.get("assignee") ?? "all";
  const filterPriority = searchParams.get("priority") ?? "all";
  const selectedTaskId = searchParams.get("taskId") ?? null;

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setFilterProject = (v: string) => updateParams({ product: v });
  const setFilterSprint = (v: string) => updateParams({ sprint: v });
  const setFilterStatus = (v: string) => updateParams({ status: v });
  const setFilterType = (v: string) => updateParams({ type: v });
  const setFilterAssignee = (v: string) => updateParams({ assignee: v });
  const setFilterPriority = (v: string) => updateParams({ priority: v });

  const openTask = useCallback(
    (id: string) => updateParams({ taskId: id }),
    [updateParams]
  );
  const closeTask = useCallback(
    () => updateParams({ taskId: null }),
    [updateParams]
  );

  useEffect(() => {
    const saved = localStorage.getItem("valk-tasks-view");
    if (saved === "list" || saved === "kanban") setView(saved);
  }, []);

  function handleViewChange(v: string) {
    const val = v as "list" | "kanban";
    setView(val);
    localStorage.setItem("valk-tasks-view", val);
  }

  const projectOptions: [string, string][] = [
    ["all", tF("all")],
    ["company", "VALK (Administrativas)"],
    ...projects.map((p) => [p.id, p.name] as [string, string]),
  ];

  // Sprint options depend on selected project
  const relevantSprints = filterProject !== "all" && filterProject !== "company"
    ? sprints.filter((s) => s.project_id === filterProject)
    : sprints;

  const sprintOptions: [string, string][] = [
    ["all", tS("all")],
    ["active", `⚡ ${tS("active")}`],
    ["none", tS("noSprint")],
    ...relevantSprints.map((s) => [
      s.id,
      s.status === "active" ? `● ${s.name}` : s.name,
    ] as [string, string]),
  ];

  const assigneeOptions: [string, string][] = [
    ["all", tF("all")],
    ...users.map((u) => [u.id, u.name] as [string, string]),
  ];

  const activeSprintIds = sprints.filter((s) => s.status === "active").map((s) => s.id);

  const filtered = tasks.filter((t) => {
    if (filterProject === "company" && t.project_id !== null) return false;
    if (filterProject !== "all" && filterProject !== "company" && t.project_id !== filterProject) return false;
    if (filterSprint === "active" && !activeSprintIds.includes(t.sprint_id ?? "")) return false;
    if (filterSprint === "none" && t.sprint_id != null) return false;
    if (filterSprint !== "all" && filterSprint !== "active" && filterSprint !== "none" && t.sprint_id !== filterSprint) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterAssignee !== "all" && t.assignee_id !== filterAssignee) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const hideSprintBadge = filterSprint !== "all" && filterSprint !== "active";

  const doingCount = filtered.filter((t) => t.status === "doing").length;
  const holdCount = filtered.filter((t) => t.status === "on_hold").length;

  return (
    <div className="fadeUp">
      <PageHeader
        title="Tasks"
        subtitle={`${filtered.length} de ${tasks.length} · ${doingCount} em progresso · ${holdCount} em espera`}
        action={
          <>
            <Segmented
              value={view}
              onChange={handleViewChange}
              options={[
                { value: "list", label: t("list"), icon: <List size={12} /> },
                { value: "kanban", label: t("kanban"), icon: <Kanban size={12} /> },
              ]}
            />
            <CreateTaskDialog projects={projects} users={users}>
              <button className="btn primary">
                <Plus size={13} strokeWidth={1.5} />
                {t("newTask")}
              </button>
            </CreateTaskDialog>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center" style={{ gap: 8, marginBottom: 22 }}>
        <Filter size={16} style={{ color: "#444" }} />
        <FilterPill label={tF("product")} value={filterProject} options={projectOptions} onChange={setFilterProject} />
        <FilterPill label={tS("label")} value={filterSprint} options={sprintOptions} onChange={setFilterSprint} />
        <FilterPill label={tF("status")} value={filterStatus} options={STATUS_OPTIONS} onChange={setFilterStatus} />
        <FilterPill label={tF("type")} value={filterType} options={TYPE_OPTIONS} onChange={setFilterType} />
        <FilterPill label={tF("assignee")} value={filterAssignee} options={assigneeOptions} onChange={setFilterAssignee} />
        <FilterPill label={tF("priority")} value={filterPriority} options={PRIORITY_OPTIONS} onChange={setFilterPriority} />
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div
          className="card"
          style={{ padding: 48, textAlign: "center", color: "var(--text-ghost)", fontSize: 12 }}
        >
          Nenhuma task encontrada com esses filtros.
        </div>
      ) : view === "list" ? (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <TaskListView tasks={filtered} users={users} onTaskClick={openTask} />
        </div>
      ) : (
        <TaskKanbanView tasks={filtered} users={users} onTaskClick={openTask} showSprintBadge={!hideSprintBadge} />
      )}

      <TaskDetailDialog taskId={selectedTaskId} onClose={closeTask} />
    </div>
  );
}
