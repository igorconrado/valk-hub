"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CreateProjectInput = {
  name: string;
  description: string;
  phase: string;
  thesis_type: string;
  thesis_hypothesis: string;
  launch_target: string;
};

export async function createProject(input: CreateProjectInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  // Get the users table record for the auth user
  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) {
    return { error: "Usuário não encontrado" };
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      description: input.description || null,
      phase: input.phase,
      thesis_type: input.thesis_type || null,
      thesis_hypothesis: input.thesis_hypothesis || null,
      launch_target: input.launch_target || null,
      owner_id: dbUser.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Add creator as project member
  await supabase.from("project_members").insert({
    project_id: project.id,
    user_id: dbUser.id,
    role_in_project: "owner",
  });

  // Log activity
  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "project_created",
    entity_type: "project",
    entity_id: project.id,
    metadata: { name: input.name },
  });

  revalidatePath("/projects");

  return { error: null };
}

type UpdateProjectInput = {
  id: string;
  name: string;
  description: string;
  phase: string;
  status: string;
  thesis_type: string;
  thesis_hypothesis: string;
  launch_target: string;
};

export async function updateProject(input: UpdateProjectInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) {
    return { error: "Usuário não encontrado" };
  }

  const { error } = await supabase
    .from("projects")
    .update({
      name: input.name,
      description: input.description || null,
      phase: input.phase,
      status: input.status,
      thesis_type: input.thesis_type || null,
      thesis_hypothesis: input.thesis_hypothesis || null,
      launch_target: input.launch_target || null,
    })
    .eq("id", input.id);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "updated_project",
    entity_type: "project",
    entity_id: input.id,
    metadata: { name: input.name },
  });

  revalidatePath(`/projects/${input.id}`);
  revalidatePath("/projects");

  return { error: null };
}

export async function removeMember(projectId: string, userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado" };

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) return { error: "Usuário não encontrado" };

  // Get the member name for the activity log
  const { data: member } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "removed_member",
    entity_type: "project",
    entity_id: projectId,
    metadata: { member_name: member?.name },
  });

  revalidatePath(`/projects/${projectId}`);

  return { error: null };
}

export async function addMember(
  projectId: string,
  userId: string,
  roleInProject: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado" };

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) return { error: "Usuário não encontrado" };

  const { data: member } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  const { error } = await supabase.from("project_members").insert({
    project_id: projectId,
    user_id: userId,
    role_in_project: roleInProject,
  });

  if (error) return { error: error.message };

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "added_member",
    entity_type: "project",
    entity_id: projectId,
    metadata: { member_name: member?.name },
  });

  revalidatePath(`/projects/${projectId}`);

  return { error: null, memberName: member?.name };
}
