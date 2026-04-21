import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

const LINEAR_STATUS_MAP: Record<string, string> = {
  Backlog: "backlog",
  Triage: "backlog",
  Todo: "doing",
  "In Progress": "doing",
  Started: "doing",
  "In Review": "review",
  Done: "done",
  Completed: "done",
  Cancelled: "cancelled",
  Canceled: "cancelled",
};

const LINEAR_PRIORITY_MAP: Record<number, string> = {
  0: "low",
  1: "urgent",
  2: "high",
  3: "medium",
  4: "low",
};

function verifySignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody);
  const digest = hmac.digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}

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

async function findUserByEmail(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string | null | undefined
): Promise<string | null> {
  if (!email) return null;
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  return data?.id ?? null;
}

function mapStatus(stateName: string | undefined): string {
  if (!stateName) return "backlog";
  return LINEAR_STATUS_MAP[stateName] ?? "backlog";
}

function mapPriority(priority: number | undefined): string {
  if (priority === undefined) return "medium";
  return LINEAR_PRIORITY_MAP[priority] ?? "medium";
}

async function handleIssueCreate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  data: Record<string, unknown>
) {
  const teamId = data.teamId as string | undefined;
  const issueId = data.id as string;
  const eventType = "Issue.create";

  if (!teamId) {
    await logSync(supabase, {
      linear_issue_id: issueId,
      direction: "inbound",
      event_type: eventType,
      status: "error",
      error_message: "No teamId in payload",
    });
    return;
  }

  const { data: syncConfig } = await supabase
    .from("linear_sync_config")
    .select("project_id, sync_enabled")
    .eq("team_id", teamId)
    .maybeSingle();

  if (!syncConfig?.sync_enabled) {
    await logSync(supabase, {
      linear_issue_id: issueId,
      direction: "inbound",
      event_type: eventType,
      status: "error",
      error_message: "No sync config or sync disabled for team",
    });
    return;
  }

  // Check if task already exists for this linear issue
  const { data: existing } = await supabase
    .from("tasks")
    .select("id")
    .eq("linear_issue_id", issueId)
    .maybeSingle();

  if (existing) {
    await logSync(supabase, {
      project_id: syncConfig.project_id,
      task_id: existing.id,
      linear_issue_id: issueId,
      direction: "inbound",
      event_type: eventType,
      status: "success",
      error_message: "Task already exists, skipped",
    });
    return;
  }

  const assigneeEmail = (data.assignee as Record<string, unknown>)?.email as
    | string
    | undefined;
  const assigneeId = await findUserByEmail(supabase, assigneeEmail);

  const stateName = (data.state as Record<string, unknown>)?.name as
    | string
    | undefined;

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      title: (data.title as string) ?? "Untitled",
      description: (data.description as string) ?? null,
      type: "dev",
      project_id: syncConfig.project_id,
      assignee_id: assigneeId,
      status: mapStatus(stateName),
      priority: mapPriority(data.priority as number | undefined),
      due_date: (data.dueDate as string) ?? null,
      tags: [],
      linear_issue_id: issueId,
      created_by: assigneeId,
    })
    .select("id")
    .single();

  if (error) {
    await logSync(supabase, {
      project_id: syncConfig.project_id,
      linear_issue_id: issueId,
      direction: "inbound",
      event_type: eventType,
      status: "error",
      error_message: error.message,
    });
    return;
  }

  await logSync(supabase, {
    project_id: syncConfig.project_id,
    task_id: task.id,
    linear_issue_id: issueId,
    direction: "inbound",
    event_type: eventType,
    status: "success",
  });
}

async function handleIssueUpdate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  data: Record<string, unknown>,
  updatedFrom: Record<string, unknown> | null
) {
  const issueId = data.id as string;
  const eventType = "Issue.update";

  const { data: task } = await supabase
    .from("tasks")
    .select("id, project_id")
    .eq("linear_issue_id", issueId)
    .maybeSingle();

  if (!task) {
    await logSync(supabase, {
      linear_issue_id: issueId,
      direction: "inbound",
      event_type: eventType,
      status: "error",
      error_message: "No matching task found",
    });
    return;
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.title !== undefined && data.title !== updatedFrom?.title) {
    updates.title = data.title;
  }
  if (
    data.description !== undefined &&
    data.description !== updatedFrom?.description
  ) {
    updates.description = data.description || null;
  }
  if (data.priority !== undefined && data.priority !== updatedFrom?.priority) {
    updates.priority = mapPriority(data.priority as number);
  }
  if (data.state && updatedFrom?.state) {
    const newStateName = (data.state as Record<string, unknown>)?.name as string;
    const oldStateName = (updatedFrom.state as Record<string, unknown>)
      ?.name as string;
    if (newStateName !== oldStateName) {
      updates.status = mapStatus(newStateName);
    }
  }
  if (data.assignee !== undefined) {
    const assigneeEmail = (data.assignee as Record<string, unknown>)
      ?.email as string | undefined;
    const assigneeId = await findUserByEmail(supabase, assigneeEmail);
    if (assigneeId) {
      updates.assignee_id = assigneeId;
    }
  }
  if (data.dueDate !== undefined && data.dueDate !== updatedFrom?.dueDate) {
    updates.due_date = (data.dueDate as string) || null;
  }

  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", task.id);

  if (error) {
    await logSync(supabase, {
      project_id: task.project_id,
      task_id: task.id,
      linear_issue_id: issueId,
      direction: "inbound",
      event_type: eventType,
      status: "error",
      error_message: error.message,
    });
    return;
  }

  await logSync(supabase, {
    project_id: task.project_id,
    task_id: task.id,
    linear_issue_id: issueId,
    direction: "inbound",
    event_type: eventType,
    status: "success",
  });
}

async function handleIssueRemove(
  supabase: Awaited<ReturnType<typeof createClient>>,
  data: Record<string, unknown>
) {
  const issueId = data.id as string;
  const eventType = "Issue.remove";

  const { data: task } = await supabase
    .from("tasks")
    .select("id, project_id")
    .eq("linear_issue_id", issueId)
    .maybeSingle();

  if (!task) {
    await logSync(supabase, {
      linear_issue_id: issueId,
      direction: "inbound",
      event_type: eventType,
      status: "error",
      error_message: "No matching task found",
    });
    return;
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", task.id);

  if (error) {
    await logSync(supabase, {
      project_id: task.project_id,
      task_id: task.id,
      linear_issue_id: issueId,
      direction: "inbound",
      event_type: eventType,
      status: "error",
      error_message: error.message,
    });
    return;
  }

  await logSync(supabase, {
    project_id: task.project_id,
    task_id: task.id,
    linear_issue_id: issueId,
    direction: "inbound",
    event_type: eventType,
    status: "success",
  });
}

async function handleCycleEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  data: Record<string, unknown>,
  action: string
) {
  const cycleId = data.id as string;
  const teamId = data.teamId as string | undefined;
  const eventType = `Cycle.${action}`;

  if (!teamId) {
    await logSync(supabase, {
      linear_issue_id: cycleId,
      direction: "inbound",
      event_type: eventType,
      status: "error",
      error_message: "No teamId in cycle payload",
    });
    return;
  }

  const { data: syncConfig } = await supabase
    .from("linear_sync_config")
    .select("project_id")
    .eq("team_id", teamId)
    .maybeSingle();

  const { error } = await supabase.from("linear_cycles").upsert(
    {
      linear_cycle_id: cycleId,
      project_id: syncConfig?.project_id ?? null,
      linear_team_id: teamId,
      name: (data.name as string) ?? null,
      number: (data.number as number) ?? null,
      starts_at: (data.startsAt as string) ?? null,
      ends_at: (data.endsAt as string) ?? null,
    },
    { onConflict: "linear_cycle_id" }
  );

  await logSync(supabase, {
    project_id: syncConfig?.project_id ?? null,
    direction: "inbound",
    event_type: eventType,
    status: error ? "error" : "success",
    error_message: error?.message ?? null,
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("linear-signature");
  const globalSecret = process.env.LINEAR_WEBHOOK_SECRET;

  // SECRET is MANDATORY — never skip verification
  if (!globalSecret) {
    console.error("[linear-webhook] LINEAR_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  if (!signature) {
    return new Response("Missing signature", { status: 401 });
  }

  const valid = verifySignature(rawBody, signature, globalSecret);
  if (!valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" });
  }

  const action = payload.action as string | undefined;
  const type = payload.type as string | undefined;
  const data = payload.data as Record<string, unknown> | undefined;
  const updatedFrom = (payload.updatedFrom as Record<string, unknown>) ?? null;

  if (!action || !type || !data) {
    return NextResponse.json({ ok: false, error: "Missing fields" });
  }

  const supabase = await createClient();

  try {
    if (type === "Issue") {
      if (action === "create") {
        await handleIssueCreate(supabase, data);
      } else if (action === "update") {
        await handleIssueUpdate(supabase, data, updatedFrom);
      } else if (action === "remove") {
        await handleIssueRemove(supabase, data);
      }
    } else if (type === "Cycle") {
      if (action === "create" || action === "update") {
        await handleCycleEvent(supabase, data, action);
      }
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";
    await logSync(supabase, {
      linear_issue_id: (data.id as string) ?? null,
      direction: "inbound",
      event_type: `${type}.${action}`,
      status: "error",
      error_message: errorMessage,
    });
  }

  return NextResponse.json({ ok: true });
}
