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

  return (
    <ProjectDetail
      project={project as any}
      members={members}
      availableUsers={availableUsers}
    />
  );
}
