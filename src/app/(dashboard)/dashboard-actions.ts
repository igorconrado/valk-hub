"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function completePendingItem(
  id: string,
  source: "task" | "action_item"
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

  if (source === "task") {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "done", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { error: error.message };

    await supabase.from("activity_log").insert({
      user_id: dbUser.id,
      action: "task_status_changed",
      entity_type: "task",
      entity_id: id,
      metadata: { status: "done" },
    });

    revalidatePath("/tasks");
  } else {
    // Complete action item + linked task
    const { data: item } = await supabase
      .from("action_items")
      .select("task_id, meeting_id")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("action_items")
      .update({
        status: "done",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { error: error.message };

    if (item?.task_id) {
      await supabase
        .from("tasks")
        .update({ status: "done", updated_at: new Date().toISOString() })
        .eq("id", item.task_id);
    }

    if (item?.meeting_id) revalidatePath(`/meetings/${item.meeting_id}`);
    revalidatePath("/tasks");
  }

  revalidatePath("/");
  return { error: null };
}

export async function saveCompanyMetrics(cash: number, burnRate: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const runwayMonths =
    burnRate > 0 ? Math.round((cash / burnRate) * 10) / 10 : null;

  const today = new Date().toISOString().split("T")[0];

  const { error } = await supabase.from("company_metrics").upsert(
    {
      date: today,
      runway_months: runwayMonths,
      burn_rate: burnRate,
      data_json: { cash, burn_rate: burnRate },
    },
    { onConflict: "date" }
  );

  if (error) return { error: error.message };

  revalidatePath("/");
  return { error: null };
}
