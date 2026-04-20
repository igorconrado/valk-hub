import { createClient } from "@/lib/supabase/server";
import { TasksContent } from "./tasks-content";

export default async function TasksPage() {
  const supabase = await createClient();

  // Fetch root tasks only (no subtasks) with assignee and project (including task_prefix)
  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      "*, assignee:users!assignee_id(id, name, avatar_url), project:projects!project_id(id, name, logo_url, task_prefix)"
    )
    .is("parent_task_id", null)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  // Fetch subtask counts per parent
  const { data: subtaskAgg } = await supabase
    .from("tasks")
    .select("parent_task_id, status")
    .not("parent_task_id", "is", null);

  const subtaskMap = new Map<string, { total: number; done: number }>();
  if (subtaskAgg) {
    for (const row of subtaskAgg) {
      const pid = row.parent_task_id as string;
      const entry = subtaskMap.get(pid) ?? { total: 0, done: 0 };
      entry.total++;
      if (row.status === "done") entry.done++;
      subtaskMap.set(pid, entry);
    }
  }

  // Fetch sprints
  const { data: sprints } = await supabase
    .from("sprints")
    .select("id, number, name, status, project_id, starts_at, ends_at")
    .order("project_id", { ascending: true })
    .order("number", { ascending: true });

  // Build sprint map for quick lookup
  const sprintMap = new Map<string, { id: string; number: number; name: string; status: string }>();
  for (const s of sprints ?? []) {
    sprintMap.set(s.id as string, {
      id: s.id as string,
      number: s.number as number,
      name: s.name as string,
      status: s.status as string,
    });
  }

  // Attach subtask counts and sprint to tasks
  const enriched = (tasks ?? []).map((t) => ({
    ...t,
    display_id: (t as Record<string, unknown>).display_id as string | undefined,
    ready_to_advance: (t as Record<string, unknown>).ready_to_advance as boolean | null,
    sprint_id: (t as Record<string, unknown>).sprint_id as string | null,
    subtasks_count: subtaskMap.get(t.id) ?? undefined,
    sprint: (t as Record<string, unknown>).sprint_id
      ? sprintMap.get((t as Record<string, unknown>).sprint_id as string) ?? null
      : null,
  }));

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .order("name");

  const { data: users } = await supabase
    .from("users")
    .select("id, name")
    .order("name");

  return (
    <TasksContent
      tasks={enriched}
      projects={projects ?? []}
      users={users ?? []}
      sprints={(sprints ?? []).map((s) => ({
        id: s.id as string,
        number: s.number as number,
        name: s.name as string,
        status: s.status as string,
        project_id: s.project_id as string,
      }))}
    />
  );
}
