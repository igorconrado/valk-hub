"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createNotifications } from "@/lib/notifications/create";
import { formatActionError } from "@/lib/action-error";

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
  try {
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
  } catch (err) {
    return { error: formatActionError(err), id: null };
  }
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
  try {
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
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

// --- Publish report ---

export async function publishReport(reportId: string) {
  try {
    const { supabase, dbUser, error: authError } = await getAuthUser();
    if (authError || !dbUser) return { error: authError };

    const { error } = await supabase
      .from("reports")
      .update({ status: "published", updated_at: new Date().toISOString() })
      .eq("id", reportId);

    if (error) return { error: error.message };

    // Fetch title for activity log and notifications
    const { data: report } = await supabase
      .from("reports")
      .select("title")
      .eq("id", reportId)
      .single();

    await supabase.from("activity_log").insert({
      user_id: dbUser.id,
      action: "published_report",
      entity_type: "report",
      entity_id: reportId,
      metadata: { title: report?.title ?? "" },
    });

    // Notify all users (except publisher)
    const { data: allUsers } = await supabase.from("users").select("id");
    const toNotify = (allUsers ?? [])
      .map((u) => u.id as string)
      .filter((uid) => uid !== dbUser.id);
    if (report && toNotify.length > 0) {
      await createNotifications(
        toNotify.map((uid) => ({
          userId: uid,
          type: "report_published" as const,
          title: `Relatório '${report.title}' publicado`,
          entityType: "report",
          entityId: reportId,
        }))
      );
    }

    revalidatePath(`/reports/${reportId}`);
    revalidatePath("/reports");
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

// --- Delete report ---

export async function deleteReport(reportId: string) {
  try {
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
  } catch (err) {
    return { error: formatActionError(err) };
  }
}
