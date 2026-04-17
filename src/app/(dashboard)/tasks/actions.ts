"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createLinearIssue,
  syncTaskFieldToLinear,
  updateLinearIssue,
} from "@/lib/linear/sync";

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

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, dbUser: null, error: "Nao autenticado" };

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser)
    return { supabase, dbUser: null, error: "Usuario nao encontrado" };
  return { supabase, dbUser, error: null };
}

async function autoResolveBlocks(
  taskId: string,
  dbUserId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  await supabase
    .from("task_blocks")
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq("task_id", taskId)
    .eq("resolved", false);

  await supabase.from("activity_log").insert({
    user_id: dbUserId,
    action: "unblocked_task",
    entity_type: "task",
    entity_id: taskId,
    metadata: {},
  });
}

// --- Create task ---

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
    const linearIssueId = await createLinearIssue(
      {
        id: task.id,
        title: input.title,
        description: input.description || null,
        priority: input.priority,
        status: "backlog",
        assignee_id: input.assignee_id,
      },
      projectId
    );

    if (linearIssueId) {
      await supabase
        .from("tasks")
        .update({ linear_issue_id: linearIssueId })
        .eq("id", task.id);
      synced = true;
    }
  }

  // Get project name for activity log
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

// --- Update single field ---

export async function updateTaskField(
  taskId: string,
  field: string,
  value: string | string[] | null
) {
  const { supabase, dbUser, error: authError } = await getAuthUser();
  if (authError || !dbUser) return { error: authError };

  // If changing status from on_hold, auto-resolve blocks
  if (field === "status" && typeof value === "string" && value !== "on_hold") {
    const { data: currentTask } = await supabase
      .from("tasks")
      .select("status")
      .eq("id", taskId)
      .single();

    if (currentTask?.status === "on_hold") {
      await autoResolveBlocks(taskId, dbUser.id, supabase);
    }
  }

  const { error } = await supabase
    .from("tasks")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) return { error: error.message };

  // Linear sync for scalar fields
  if (typeof value === "string" || value === null) {
    await syncTaskFieldToLinear(taskId, field, value);
  }

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "task_updated",
    entity_type: "task",
    entity_id: taskId,
    metadata: { field, value: String(value) },
  });

  revalidatePath("/tasks");
  return { error: null };
}

// --- Resolve block ---

export async function resolveTaskBlock(blockId: string) {
  const { supabase, dbUser, error: authError } = await getAuthUser();
  if (authError || !dbUser) return { error: authError };

  const { error } = await supabase
    .from("task_blocks")
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq("id", blockId);

  if (error) return { error: error.message };

  const { data: block } = await supabase
    .from("task_blocks")
    .select("task_id")
    .eq("id", blockId)
    .single();

  if (block) {
    await supabase.from("activity_log").insert({
      user_id: dbUser.id,
      action: "task_block_resolved",
      entity_type: "task",
      entity_id: block.task_id,
      metadata: {},
    });
  }

  revalidatePath("/tasks");
  return { error: null };
}

// --- Get task detail ---

export async function getTaskDetail(taskId: string) {
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select(
      "*, assignee:users!assignee_id(id, name, avatar_url), project:projects!project_id(id, name, logo_url)"
    )
    .eq("id", taskId)
    .single();

  if (!task) return null;

  const { data: blocks } = await supabase
    .from("task_blocks")
    .select(
      "*, created_by_user:users!created_by(name), blocked_by:users!blocked_by_user_id(name)"
    )
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  const { data: activities } = await supabase
    .from("activity_log")
    .select("*, user:users!user_id(name)")
    .eq("entity_type", "task")
    .eq("entity_id", taskId)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .order("name");

  const { data: users } = await supabase
    .from("users")
    .select("id, name")
    .order("name");

  return {
    task,
    blocks: blocks ?? [],
    activities: activities ?? [],
    projects: projects ?? [],
    users: users ?? [],
  };
}

// --- Update status (kanban drag) ---

export async function updateTaskStatus(taskId: string, status: string) {
  const { supabase, dbUser, error: authError } = await getAuthUser();
  if (authError || !dbUser) return { error: authError };

  // If moving FROM on_hold, auto-resolve blocks
  if (status !== "on_hold") {
    const { data: currentTask } = await supabase
      .from("tasks")
      .select("status")
      .eq("id", taskId)
      .single();

    if (currentTask?.status === "on_hold") {
      await autoResolveBlocks(taskId, dbUser.id, supabase);
    }
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) return { error: error.message };

  // Linear sync
  await syncTaskFieldToLinear(taskId, "status", status);

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

// --- Create block (on_hold) ---

export async function createTaskBlock(
  taskId: string,
  reason: string,
  blockedByUserId: string | null
) {
  const { supabase, dbUser, error: authError } = await getAuthUser();
  if (authError || !dbUser) return { error: authError };

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

  // Linear sync — set on_hold status
  await syncTaskFieldToLinear(taskId, "status", "on_hold");

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "blocked_task",
    entity_type: "task",
    entity_id: taskId,
    metadata: { reason },
  });

  revalidatePath("/tasks");
  return { error: null };
}
