import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PersonView } from "./person-view";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: person } = await supabase
    .from("users")
    .select("id, name, email, role, company_role, avatar_url, dedication")
    .eq("id", id)
    .single();

  if (!person) notFound();

  // Current user ID
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  let currentUserId: string | null = null;
  if (authUser) {
    const { data: dbUser } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", authUser.id)
      .maybeSingle();
    currentUserId = dbUser?.id ?? null;
  }

  // Projects this user is a member of
  const { data: memberships } = await supabase
    .from("project_members")
    .select(
      "role_in_project, project:projects!project_id(id, name, phase, status, logo_url)"
    )
    .eq("user_id", id);

  const projects = (memberships ?? []).map((m) => {
    const proj = Array.isArray(m.project) ? m.project[0] : m.project;
    return {
      id: proj?.id as string,
      name: proj?.name as string,
      phase: proj?.phase as string,
      status: proj?.status as string,
      logo_url: proj?.logo_url as string | null,
      role_in_project: m.role_in_project as string,
    };
  }).filter((p) => p.id);

  // Active tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      "id, title, status, priority, type, due_date, project:projects!project_id(id, name)"
    )
    .eq("assignee_id", id)
    .not("status", "in", "(done,cancelled)")
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(10);

  // Activity log
  const { data: activities } = await supabase
    .from("activity_log")
    .select("id, action, entity_type, entity_id, metadata, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <PersonView
      person={person as any}
      currentUserId={currentUserId}
      projects={projects}
      tasks={(tasks as any[]) ?? []}
      activities={(activities ?? []).map((a) => ({
        id: a.id as string,
        action: a.action as string,
        entity_type: a.entity_type as string | null,
        entity_id: a.entity_id as string | null,
        metadata: a.metadata as Record<string, string> | null,
        created_at: a.created_at as string,
      }))}
    />
  );
}
