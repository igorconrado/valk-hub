"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, dbUser: null, error: "Não autenticado" };

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser)
    return { supabase, dbUser: null, error: "Usuário não encontrado" };
  return { supabase, dbUser, error: null };
}

// --- Create report ---

type CreateReportInput = {
  title: string;
  type: string;
  project_id: string | null;
  period_start: string | null;
  period_end: string | null;
  content: string;
  data_json: Record<string, unknown>;
  ai_generated: boolean;
};

export async function createReport(input: CreateReportInput) {
  const { supabase, dbUser, error: authError } = await getAuthUser();
  if (authError || !dbUser) return { error: authError, id: null };

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      title: input.title,
      type: input.type,
      project_id: input.project_id || null,
      period_start: input.period_start || null,
      period_end: input.period_end || null,
      content: input.content,
      data_json: input.data_json,
      ai_generated: input.ai_generated,
      status: "draft",
      created_by: dbUser.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message, id: null };

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "created_report",
    entity_type: "report",
    entity_id: report.id,
    metadata: { title: input.title, type: input.type, ai: input.ai_generated },
  });

  revalidatePath("/reports");
  return { error: null, id: report.id };
}

// --- Save report ---

export async function saveReport(
  reportId: string,
  updates: {
    title?: string;
    content?: string;
    type?: string;
    status?: string;
    project_id?: string | null;
  }
) {
  const { supabase, dbUser, error: authError } = await getAuthUser();
  if (authError || !dbUser) return { error: authError };

  const { error } = await supabase
    .from("reports")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) return { error: error.message };

  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/reports");
  return { error: null };
}

// --- Publish report ---

export async function publishReport(reportId: string) {
  const { supabase, dbUser, error: authError } = await getAuthUser();
  if (authError || !dbUser) return { error: authError };

  const { error } = await supabase
    .from("reports")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) return { error: error.message };

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "published_report",
    entity_type: "report",
    entity_id: reportId,
    metadata: {},
  });

  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/reports");
  return { error: null };
}

// --- Delete report ---

export async function deleteReport(reportId: string) {
  const { supabase, dbUser, error: authError } = await getAuthUser();
  if (authError || !dbUser) return { error: authError };

  await supabase
    .from("activity_log")
    .delete()
    .eq("entity_type", "report")
    .eq("entity_id", reportId);

  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", reportId);

  if (error) return { error: error.message };

  revalidatePath("/reports");
  redirect("/reports");
}
