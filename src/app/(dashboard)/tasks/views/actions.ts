"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, requireAdmin } from "@/lib/auth/authz";
import { revalidatePath } from "next/cache";
import type { ViewFilters } from "@/types/task-view";

interface CreateViewInput {
  name: string;
  icon: string;
  scope: "workspace" | "personal";
  filters: ViewFilters;
}

export async function createTaskView(input: CreateViewInput) {
  try {
    const ctx = input.scope === "workspace"
      ? await requireAdmin()
      : await requireUser();

    const supabase = ctx.supabase;
    const { data, error } = await supabase
      .from("task_views")
      .insert({
        name: input.name,
        icon: input.icon,
        scope: input.scope,
        owner_id: input.scope === "personal" ? ctx.dbUser.id : null,
        filters: input.filters,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/tasks");
    return { error: null, id: data.id };
  } catch {
    return { error: "Sem permissão" };
  }
}

export async function updateTaskView(
  id: string,
  patch: { name?: string; icon?: string; filters?: ViewFilters }
) {
  try {
    const ctx = await requireUser();
    const supabase = ctx.supabase;

    const { data: view } = await supabase
      .from("task_views")
      .select("scope, owner_id")
      .eq("id", id)
      .single();

    if (!view) return { error: "View não encontrada" };
    if (view.scope === "system") return { error: "Views do sistema não podem ser editadas" };
    if (view.scope === "workspace") await requireAdmin();
    if (view.scope === "personal" && view.owner_id !== ctx.dbUser.id) {
      return { error: "Sem permissão" };
    }

    const updates: Record<string, unknown> = {};
    if (patch.name) updates.name = patch.name;
    if (patch.icon) updates.icon = patch.icon;
    if (patch.filters) updates.filters = patch.filters;

    const { error } = await supabase
      .from("task_views")
      .update(updates)
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/tasks");
    return { error: null };
  } catch {
    return { error: "Sem permissão" };
  }
}

export async function deleteTaskView(id: string) {
  try {
    const ctx = await requireUser();
    const supabase = ctx.supabase;

    const { data: view } = await supabase
      .from("task_views")
      .select("scope, owner_id")
      .eq("id", id)
      .single();

    if (!view) return { error: "View não encontrada" };
    if (view.scope === "system") return { error: "Views do sistema não podem ser deletadas" };
    if (view.scope === "workspace") await requireAdmin();
    if (view.scope === "personal" && view.owner_id !== ctx.dbUser.id) {
      return { error: "Sem permissão" };
    }

    const { error } = await supabase.from("task_views").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/tasks");
    return { error: null };
  } catch {
    return { error: "Sem permissão" };
  }
}
