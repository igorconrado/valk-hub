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

  // Supabase returns the joined user as an array for untyped schemas,
  // normalize to a single object
  const members = (rawMembers ?? []).map((m) => ({
    role_in_project: m.role_in_project as string,
    user: Array.isArray(m.user) ? m.user[0] : m.user,
  }));

  return <ProjectDetail project={project as any} members={members} />;
}
