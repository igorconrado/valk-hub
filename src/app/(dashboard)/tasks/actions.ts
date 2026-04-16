"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { linearClient } from "@/lib/linear/client";

type CreateTaskInput = {
  title: string;
  description: string;
  type: string;
  project_id: string;
  assignee_id: string;
  priority: string;
  due_date: string;
  tags: string;
};

const PRIORITY_TO_LINEAR: Record<string, number> = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
};

export async function createTask(input: CreateTaskInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nao autenticado", synced: false };

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) return { error: "Usuario nao encontrado", synced: false };

  const projectId = input.project_id || null;
  const tags = input.tags
    ? input.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      description: input.description || null,
      type: input.type,
      project_id: projectId,
      assignee_id: input.assignee_id,
      status: "backlog",
      priority: input.priority,
      due_date: input.due_date || null,
      tags,
      created_by: dbUser.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message, synced: false };

  // Linear sync for dev tasks
  let synced = false;
  if (input.type === "dev" && projectId) {
    const { data: syncConfig } = await supabase
      .from("linear_sync_config")
      .select("team_id, sync_enabled")
      .eq("project_id", projectId)
      .maybeSingle();

    if (syncConfig?.sync_enabled && syncConfig.team_id) {
      try {
        const issue = await linearClient.createIssue({
          teamId: syncConfig.team_id,
          title: input.title,
          description: input.description || undefined,
          priority: PRIORITY_TO_LINEAR[input.priority] ?? 3,
        });

        const created = await issue.issue;
        if (created) {
          await supabase
            .from("tasks")
            .update({ linear_issue_id: created.id })
            .eq("id", task.id);
          synced = true;
        }
      } catch {
        // Linear sync failed silently — task is still created locally
      }
    }
  }

  // Get project name for activity log metadata
  let projectName: string | null = null;
  if (projectId) {
    const { data: proj } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .single();
    projectName = proj?.name ?? null;
  }

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "created_task",
    entity_type: "task",
    entity_id: task.id,
    metadata: {
      task_title: input.title,
      project_name: projectName ?? "Empresa",
    },
  });

  revalidatePath("/tasks");
  if (projectId) revalidatePath(`/projects/${projectId}`);

  return { error: null, synced };
}

export async function updateTaskStatus(taskId: string, status: string) {
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

  const { error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) return { error: error.message };

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "task_status_changed",
    entity_type: "task",
    entity_id: taskId,
    metadata: { status },
  });

  revalidatePath("/tasks");

  return { error: null };
}

export async function createTaskBlock(
  taskId: string,
  reason: string,
  blockedByUserId: string | null
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

  const { error: blockError } = await supabase.from("task_blocks").insert({
    task_id: taskId,
    reason,
    blocked_by_user_id: blockedByUserId || null,
    created_by: dbUser.id,
  });

  if (blockError) return { error: blockError.message };

  const { error: statusError } = await supabase
    .from("tasks")
    .update({ status: "on_hold", updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (statusError) return { error: statusError.message };

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "task_blocked",
    entity_type: "task",
    entity_id: taskId,
    metadata: { reason },
  });

  revalidatePath("/tasks");

  return { error: null };
}
