import { createClient } from "@/lib/supabase/server";
import { getLinearClient } from "./client";

// --- Mappings ---

const STATUS_TO_LINEAR: Record<string, string> = {
  backlog: "Backlog",
  doing: "In Progress",
  on_hold: "Triage",
  review: "In Review",
  done: "Done",
  cancelled: "Cancelled",
};

const PRIORITY_TO_LINEAR: Record<string, number> = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
};

export function mapStatusToLinear(status: string): string {
  return STATUS_TO_LINEAR[status] ?? "Backlog";
}

export function mapPriorityToLinear(priority: string): number {
  return PRIORITY_TO_LINEAR[priority] ?? 3;
}

// --- Logging ---

async function logSync(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entry: {
    project_id?: string | null;
    task_id?: string | null;
    linear_issue_id?: string | null;
    direction: "inbound" | "outbound";
    event_type: string;
    status: "success" | "error";
    error_message?: string | null;
  }
) {
  await supabase.from("linear_sync_log").insert({
    project_id: entry.project_id ?? null,
    task_id: entry.task_id ?? null,
    linear_issue_id: entry.linear_issue_id ?? null,
    direction: entry.direction,
    event_type: entry.event_type,
    status: entry.status,
    error_message: entry.error_message ?? null,
  });
}

// --- Assignee mapping ---

export async function mapAssigneeToLinear(
  userId: string | null,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | undefined> {
  if (!userId) return undefined;

  const { data: user } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .single();

  if (!user?.email) return undefined;

  try {
    const linearUsers = await getLinearClient().users();
    const match = linearUsers.nodes.find(
      (u) => u.email?.toLowerCase() === user.email.toLowerCase()
    );
    return match?.id;
  } catch {
    return undefined;
  }
}

// --- Workflow state resolver ---

async function resolveLinearStateId(
  stateName: string
): Promise<string | undefined> {
  try {
    const states = await getLinearClient().workflowStates();
    // Try exact match first, then fallback names
    const target =
      states.nodes.find((s) => s.name === stateName) ??
      (stateName === "Triage"
        ? states.nodes.find(
            (s) => s.name === "Blocked" || s.name === "On Hold"
          )
        : undefined);
    return target?.id;
  } catch {
    return undefined;
  }
}

// --- Create ---

export async function createLinearIssue(
  task: {
    id: string;
    title: string;
    description?: string | null;
    priority: string;
    status: string;
    assignee_id?: string | null;
  },
  projectId: string
): Promise<string | null> {
  const supabase = await createClient();

  const { data: syncConfig } = await supabase
    .from("linear_sync_config")
    .select("team_id, sync_enabled")
    .eq("project_id", projectId)
    .maybeSingle();

  if (!syncConfig?.sync_enabled || !syncConfig.team_id) return null;

  try {
    const assigneeId = await mapAssigneeToLinear(
      task.assignee_id ?? null,
      supabase
    );

    const payload = await getLinearClient().createIssue({
      teamId: syncConfig.team_id,
      title: task.title,
      description: task.description || undefined,
      priority: mapPriorityToLinear(task.priority),
      assigneeId: assigneeId,
    });

    const issue = await payload.issue;

    if (!issue) {
      await logSync(supabase, {
        project_id: projectId,
        task_id: task.id,
        direction: "outbound",
        event_type: "issue.create",
        status: "error",
        error_message: "Linear createIssue returned no issue",
      });
      return null;
    }

    await logSync(supabase, {
      project_id: projectId,
      task_id: task.id,
      linear_issue_id: issue.id,
      direction: "outbound",
      event_type: "issue.create",
      status: "success",
    });

    return issue.id;
  } catch (err) {
    await logSync(supabase, {
      project_id: projectId,
      task_id: task.id,
      direction: "outbound",
      event_type: "issue.create",
      status: "error",
      error_message: err instanceof Error ? err.message : "Unknown error",
    });
    return null;
  }
}

// --- Update ---

export async function updateLinearIssue(
  taskId: string,
  linearIssueId: string,
  changes: {
    status?: string;
    priority?: string;
    assignee_id?: string | null;
    title?: string;
    description?: string | null;
  }
): Promise<void> {
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("project_id")
    .eq("id", taskId)
    .single();

  try {
    const updatePayload: Record<string, unknown> = {};

    if (changes.title !== undefined) {
      updatePayload.title = changes.title;
    }
    if (changes.description !== undefined) {
      updatePayload.description = changes.description || "";
    }
    if (changes.priority !== undefined) {
      updatePayload.priority = mapPriorityToLinear(changes.priority);
    }
    if (changes.status !== undefined) {
      const stateId = await resolveLinearStateId(
        mapStatusToLinear(changes.status)
      );
      if (stateId) updatePayload.stateId = stateId;
    }
    if (changes.assignee_id !== undefined) {
      const linearAssigneeId = await mapAssigneeToLinear(
        changes.assignee_id,
        supabase
      );
      if (linearAssigneeId) {
        updatePayload.assigneeId = linearAssigneeId;
      }
    }

    if (Object.keys(updatePayload).length === 0) return;

    await getLinearClient().updateIssue(linearIssueId, updatePayload);

    await logSync(supabase, {
      project_id: task?.project_id ?? null,
      task_id: taskId,
      linear_issue_id: linearIssueId,
      direction: "outbound",
      event_type: "issue.update",
      status: "success",
    });
  } catch (err) {
    await logSync(supabase, {
      project_id: task?.project_id ?? null,
      task_id: taskId,
      linear_issue_id: linearIssueId,
      direction: "outbound",
      event_type: "issue.update",
      status: "error",
      error_message: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

// --- Convenience: sync a single field change ---

export async function syncTaskFieldToLinear(
  taskId: string,
  field: string,
  value: string | null
): Promise<void> {
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("linear_issue_id, type")
    .eq("id", taskId)
    .single();

  if (!task?.linear_issue_id || task.type !== "dev") return;

  const changes: Record<string, unknown> = {};

  if (field === "status" && value) changes.status = value;
  else if (field === "priority" && value) changes.priority = value;
  else if (field === "assignee_id") changes.assignee_id = value;
  else if (field === "title" && value) changes.title = value;
  else if (field === "description") changes.description = value;
  else return;

  await updateLinearIssue(taskId, task.linear_issue_id, changes);
}
