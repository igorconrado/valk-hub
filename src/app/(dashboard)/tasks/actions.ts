"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
