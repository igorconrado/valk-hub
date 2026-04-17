import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectDetail } from "./project-detail";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*, owner:users!owner_id(id, name)")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: rawMembers } = await supabase
    .from("project_members")
    .select("role_in_project, user:users!user_id(id, name, company_role)")
    .eq("project_id", id);

  const members = (rawMembers ?? []).map((m) => ({
    role_in_project: m.role_in_project as string,
    user: Array.isArray(m.user) ? m.user[0] : m.user,
  }));

  // Fetch all users not already members for the add member dialog
  const memberUserIds = members
    .map((m) => m.user?.id)
    .filter(Boolean) as string[];

  let availableUsers: { id: string; name: string; company_role: string | null }[] = [];

  if (memberUserIds.length > 0) {
    const { data } = await supabase
      .from("users")
      .select("id, name, company_role")
      .not("id", "in", `(${memberUserIds.join(",")})`)
      .order("name");
    availableUsers = data ?? [];
  } else {
    const { data } = await supabase
      .from("users")
      .select("id, name, company_role")
      .order("name");
    availableUsers = data ?? [];
  }

  // Fetch tasks for this project
  const { data: projectTasks } = await supabase
    .from("tasks")
    .select(
      "*, assignee:users!assignee_id(id, name, avatar_url), project:projects!project_id(id, name, logo_url)"
    )
    .eq("project_id", id)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  // Fetch all users for task creation
  const { data: allUsers } = await supabase
    .from("users")
    .select("id, name")
    .order("name");

  // Fetch Linear sync config
  const { data: linearSyncConfig } = await supabase
    .from("linear_sync_config")
    .select("team_id, team_name, sync_enabled")
    .eq("project_id", id)
    .maybeSingle();

  // Fetch active cycle (where now is between starts_at and ends_at)
  const now = new Date().toISOString();
  const { data: activeCycle } = await supabase
    .from("linear_cycles")
    .select("*")
    .eq("project_id", id)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <ProjectDetail
      project={project as any}
      members={members}
      availableUsers={availableUsers}
      tasks={projectTasks ?? []}
      allUsers={allUsers ?? []}
      linearConfig={linearSyncConfig ?? null}
      activeCycle={activeCycle ?? null}
    />
  );
}
