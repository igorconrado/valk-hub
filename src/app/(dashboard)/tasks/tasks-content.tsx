"use client";

import { useState, useEffect } from "react";
import { List, Kanban } from "lucide-react";
import { TaskListView } from "./task-list-view";
import { TaskKanbanView } from "./task-kanban-view";

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

type FilterProject = { id: string; name: string };
type FilterUser = { id: string; name: string };

const STATUS_OPTIONS = [
  { value: "backlog", label: "Backlog" },
  { value: "doing", label: "Doing" },
  { value: "on_hold", label: "On Hold" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "dev", label: "Dev" },
  { value: "task", label: "Task" },
  { value: "meeting_prep", label: "Reuniao" },
  { value: "research", label: "Pesquisa" },
  { value: "decision", label: "Decisao" },
  { value: "report", label: "Report" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function FilterSelect({
  label,
  value,
  options,
  onChange,
  active,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  active: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`shrink-0 appearance-none rounded-lg border bg-[#0A0A0A] px-2.5 py-1.5 text-[11px] font-medium text-[#888] outline-none transition-colors duration-150 ${
        active
          ? "border-[rgba(226,75,74,0.3)]"
          : "border-[#1A1A1A] hover:border-[#2A2A2A]"
      }`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {label}: {opt.label}
        </option>
      ))}
    </select>
  );
}

function StatusMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const allSelected = selected.length === 0;

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 rounded-lg border bg-[#0A0A0A] px-2.5 py-1.5 text-[11px] font-medium text-[#888] outline-none transition-colors duration-150 ${
          !allSelected
            ? "border-[rgba(226,75,74,0.3)]"
            : "border-[#1A1A1A] hover:border-[#2A2A2A]"
        }`}
      >
        Status: {allSelected ? "Todos" : `${selected.length} selecionados`}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-[#1A1A1A] bg-[#111] p-1.5 shadow-xl">
            {STATUS_OPTIONS.map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-[#999] transition-colors hover:bg-white/[0.03]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      if (checked) {
                        onChange(selected.filter((s) => s !== opt.value));
                      } else {
                        onChange([...selected, opt.value]);
                      }
                    }}
                    className="h-3 w-3 rounded border-[#333] bg-transparent accent-[#E24B4A]"
                  />
                  {opt.label}
                </label>
              );
            })}
            {selected.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="mt-1 w-full rounded-md px-2 py-1 text-[10px] text-[#555] transition-colors hover:text-[#888]"
              >
                Limpar filtro
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function TasksContent({
  tasks,
  projects,
  users,
}: {
  tasks: TaskRow[];
  projects: FilterProject[];
  users: FilterUser[];
}) {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem("valk-tasks-view");
    if (saved === "list" || saved === "kanban") setView(saved);
  }, []);

  function handleViewChange(v: "list" | "kanban") {
    setView(v);
    localStorage.setItem("valk-tasks-view", v);
  }

  const projectOptions = [
    { value: "all", label: "Todos" },
    { value: "company", label: "Empresa" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  const assigneeOptions = [
    { value: "all", label: "Todos" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const filtered = tasks.filter((t) => {
    if (filterProject === "company" && t.project_id !== null) return false;
    if (
      filterProject !== "all" &&
      filterProject !== "company" &&
      t.project_id !== filterProject
    )
      return false;
    if (filterStatus.length > 0 && !filterStatus.includes(t.status))
      return false;
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterAssignee !== "all" && t.assignee_id !== filterAssignee)
      return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div>
      {/* Filters + View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <FilterSelect
            label="Produto"
            value={filterProject}
            options={projectOptions}
            onChange={setFilterProject}
            active={filterProject !== "all"}
          />
          <StatusMultiSelect
            selected={filterStatus}
            onChange={setFilterStatus}
          />
          <FilterSelect
            label="Tipo"
            value={filterType}
            options={TYPE_OPTIONS}
            onChange={setFilterType}
            active={filterType !== "all"}
          />
          <FilterSelect
            label="Responsavel"
            value={filterAssignee}
            options={assigneeOptions}
            onChange={setFilterAssignee}
            active={filterAssignee !== "all"}
          />
          <FilterSelect
            label="Prioridade"
            value={filterPriority}
            options={PRIORITY_OPTIONS}
            onChange={setFilterPriority}
            active={filterPriority !== "all"}
          />
        </div>
        <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-[#1A1A1A] p-0.5">
          <button
            onClick={() => handleViewChange("list")}
            className={`rounded-md p-1.5 transition-colors duration-150 ${
              view === "list"
                ? "bg-white/[0.06] text-[#ccc]"
                : "text-[#444] hover:text-[#666]"
            }`}
          >
            <List size={14} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => handleViewChange("kanban")}
            className={`rounded-md p-1.5 transition-colors duration-150 ${
              view === "kanban"
                ? "bg-white/[0.06] text-[#ccc]"
                : "text-[#444] hover:text-[#666]"
            }`}
          >
            <Kanban size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-[13px] text-[#444]">
              Sem tasks ainda. Cria a primeira.
            </p>
            <button className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#E24B4A] px-4 py-2 text-[12px] font-medium text-white transition-colors duration-150 hover:bg-[#D4403F]">
              Nova task
            </button>
          </div>
        ) : view === "list" ? (
          <TaskListView tasks={filtered} users={users} />
        ) : (
          <TaskKanbanView tasks={filtered} users={users} />
        )}
      </div>
    </div>
  );
}
