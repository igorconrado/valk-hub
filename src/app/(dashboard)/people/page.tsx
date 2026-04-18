import { createClient } from "@/lib/supabase/server";
import { PeopleGrid } from "./people-grid";
import { InviteButton } from "./invite-button";

export default async function PeoplePage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, role, company_role, avatar_url, dedication")
    .order("name");

  const userIds = (users ?? []).map((u) => u.id as string);

  let taskCounts: Record<string, number> = {};
  let projectCounts: Record<string, number> = {};

  if (userIds.length > 0) {
    const [{ data: tasks }, { data: members }] = await Promise.all([
      supabase
        .from("tasks")
        .select("assignee_id")
        .in("assignee_id", userIds)
        .not("status", "in", "(done,cancelled)"),
      supabase
        .from("project_members")
        .select("user_id")
        .in("user_id", userIds),
    ]);

    for (const t of tasks ?? []) {
      const id = t.assignee_id as string;
      taskCounts[id] = (taskCounts[id] ?? 0) + 1;
    }

    for (const m of members ?? []) {
      const id = m.user_id as string;
      projectCounts[id] = (projectCounts[id] ?? 0) + 1;
    }
  }

  const people = (users ?? []).map((u) => ({
    id: u.id as string,
    name: u.name as string,
    email: u.email as string,
    role: u.role as string,
    company_role: u.company_role as string | null,
    avatar_url: u.avatar_url as string | null,
    dedication: u.dedication as string | null,
    task_count: taskCounts[u.id as string] ?? 0,
    project_count: projectCounts[u.id as string] ?? 0,
  }));

  return (
    <div className="fadeUp">
      <div className="flex items-end justify-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="display" style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>Pessoas</h1>
          <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "6px 0 0" }}>{people.length} membros da equipe</p>
        </div>
        <InviteButton />
      </div>
      <PeopleGrid people={people} />
    </div>
  );
}
