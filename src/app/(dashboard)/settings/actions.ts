"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formatActionError } from "@/lib/action-error";

export async function saveNotificationPreferences(
  preferences: Record<string, boolean>
) {
  try {
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

    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: dbUser.id,
        notification_preferences: preferences,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

export async function savePreferences(updates: {
  default_task_view?: string;
  timezone?: string;
}) {
  try {
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

    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: dbUser.id,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) return { error: error.message };

    revalidatePath("/settings");
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}
