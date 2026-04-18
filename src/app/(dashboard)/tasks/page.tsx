import { createClient } from "@/lib/supabase/server";
import { TasksContent } from "./tasks-content";

export default async function TasksPage() {
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      "*, assignee:users!assignee_id(id, name, avatar_url), project:projects!project_id(id, name, logo_url)"
    )
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

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
      tasks={tasks ?? []}
      projects={projects ?? []}
      users={users ?? []}
    />
  );
}
