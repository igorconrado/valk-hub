"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createLinearIssue,
  syncTaskFieldToLinear,
  updateLinearIssue,
} from "@/lib/linear/sync";
import { createNotification } from "@/lib/notifications/create";
import { formatActionError } from "@/lib/action-error";

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
  try {
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

    // Notify assignee (if not self)
    if (input.assignee_id && input.assignee_id !== dbUser.id) {
      await createNotification({
        userId: input.assignee_id,
        type: "task_assigned",
        title: `Você foi atribuído a '${input.title}'`,
        entityType: "task",
        entityId: task.id,
      });
    }

    revalidatePath("/tasks");
    if (projectId) revalidatePath(`/projects/${projectId}`);

    return { error: null, synced };
  } catch (err) {
    return { error: formatActionError(err), synced: false };
  }
}

// --- Update single field ---

export async function updateTaskField(
  taskId: string,
  field: string,
  value: string | string[] | null
) {
  try {
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

    // Fetch task title for metadata
    const { data: taskForLog } = await supabase
      .from("tasks")
      .select("title")
      .eq("id", taskId)
      .single();

    await supabase.from("activity_log").insert({
      user_id: dbUser.id,
      action: "updated_task",
      entity_type: "task",
      entity_id: taskId,
      metadata: {
        task_title: taskForLog?.title ?? "",
        field,
        value: String(value),
      },
    });

    // Notify new assignee
    if (field === "assignee_id" && typeof value === "string" && value !== dbUser.id) {
      const { data: taskData } = await supabase
        .from("tasks")
        .select("title")
        .eq("id", taskId)
        .single();
      if (taskData) {
        await createNotification({
          userId: value,
          type: "task_assigned",
          title: `Você foi atribuído a '${taskData.title}'`,
          entityType: "task",
          entityId: taskId,
        });
      }
    }

    revalidatePath("/tasks");
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

// --- Resolve block ---

export async function resolveTaskBlock(blockId: string) {
  try {
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
      // Notify task assignee
      const { data: taskData } = await supabase
        .from("tasks")
        .select("title, assignee_id")
        .eq("id", block.task_id)
        .single();
      await supabase.from("activity_log").insert({
        user_id: dbUser.id,
        action: "unblocked_task",
        entity_type: "task",
        entity_id: block.task_id,
        metadata: { task_title: taskData?.title ?? "" },
      });

      if (taskData?.assignee_id && taskData.assignee_id !== dbUser.id) {
        await createNotification({
          userId: taskData.assignee_id,
          type: "task_unblocked",
          title: `'${taskData.title}' foi destravada`,
          entityType: "task",
          entityId: block.task_id,
        });
      }
    }

    revalidatePath("/tasks");
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

// --- Get task detail ---

export async function getTaskDetail(taskId: string) {
  try {
    const supabase = await createClient();

    const { data: task } = await supabase
      .from("tasks")
      .select(
        "*, assignee:users!assignee_id(id, name, avatar_url), project:projects!project_id(id, name, logo_url)"
      )
      .eq("id", taskId)
      .single();

    if (!task) return null;

    // Fetch subtasks if this is a root task (parent_task_id IS NULL)
    const isRoot = !(task as Record<string, unknown>).parent_task_id;
    let subtasks: {
      id: string;
      title: string;
      status: string;
      display_id: string;
      assignee_id: string | null;
      assignee: { id: string; name: string; avatar_url: string | null } | null;
    }[] = [];

    if (isRoot) {
      const { data: subs } = await supabase
        .from("tasks")
        .select(
          "id, title, status, display_id, assignee_id, assignee:users!assignee_id(id, name, avatar_url)"
        )
        .eq("parent_task_id", taskId)
        .order("created_at", { ascending: true });

      subtasks = (subs ?? []).map((s) => ({
        id: s.id,
        title: s.title,
        status: s.status,
        display_id: ((s as Record<string, unknown>).display_id as string) ?? s.id.slice(0, 7),
        assignee_id: s.assignee_id,
        assignee: Array.isArray(s.assignee) ? s.assignee[0] ?? null : s.assignee,
      }));
    }

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
      task: {
        ...task,
        display_id: (task as Record<string, unknown>).display_id as string | undefined,
        parent_task_id: (task as Record<string, unknown>).parent_task_id as string | null,
        ready_to_advance: (task as Record<string, unknown>).ready_to_advance as boolean | null,
      },
      subtasks,
      blocks: blocks ?? [],
      activities: activities ?? [],
      projects: projects ?? [],
      users: users ?? [],
    };
  } catch {
    return null;
  }
}

// --- Update status (kanban drag) ---

export async function updateTaskStatus(taskId: string, status: string) {
  try {
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
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

// --- Create block (on_hold) ---

export async function createTaskBlock(
  taskId: string,
  reason: string,
  blockedByUserId: string | null
) {
  try {
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

    // Notify blocked_by_user
    if (blockedByUserId && blockedByUserId !== dbUser.id) {
      const { data: taskData } = await supabase
        .from("tasks")
        .select("title")
        .eq("id", taskId)
        .single();
      if (taskData) {
        await createNotification({
          userId: blockedByUserId,
          type: "task_blocked",
          title: `'${taskData.title}' está travada e precisa de você`,
          entityType: "task",
          entityId: taskId,
        });
      }
    }

    revalidatePath("/tasks");
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

// --- Create subtask ---

export async function createSubtask(parentTaskId: string, title: string) {
  try {
    const { supabase, dbUser, error: authError } = await getAuthUser();
    if (authError || !dbUser) return { error: authError };

    const { data: parent } = await supabase
      .from("tasks")
      .select("project_id, assignee_id")
      .eq("id", parentTaskId)
      .single();

    if (!parent) return { error: "Task pai nao encontrada" };

    const { error } = await supabase.from("tasks").insert({
      title,
      parent_task_id: parentTaskId,
      type: "task",
      status: "backlog",
      priority: "medium",
      project_id: parent.project_id,
      assignee_id: parent.assignee_id,
      created_by: dbUser.id,
    });

    if (error) return { error: error.message };

    revalidatePath("/tasks");
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

// --- Toggle subtask status (backlog <-> done) ---

export async function toggleSubtaskStatus(subtaskId: string) {
  try {
    const { supabase, dbUser, error: authError } = await getAuthUser();
    if (authError || !dbUser) return { error: authError };

    const { data: subtask } = await supabase
      .from("tasks")
      .select("status")
      .eq("id", subtaskId)
      .single();

    if (!subtask) return { error: "Subtask nao encontrada" };

    const newStatus = subtask.status === "done" ? "backlog" : "done";

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", subtaskId);

    if (error) return { error: error.message };

    revalidatePath("/tasks");
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

// --- Delete subtask ---

export async function deleteSubtask(subtaskId: string) {
  try {
    const { supabase, dbUser, error: authError } = await getAuthUser();
    if (authError || !dbUser) return { error: authError };

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", subtaskId);

    if (error) return { error: error.message };

    revalidatePath("/tasks");
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}
