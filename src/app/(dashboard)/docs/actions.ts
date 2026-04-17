"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

export async function createDocument(
  projectId: string | null,
  type: string | null
) {
  const { supabase, dbUser, error: authError } = await getAuthUser();
  if (authError || !dbUser) return { error: authError, id: null };

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      title: "Sem titulo",
      content: "",
      type: type || "livre",
      project_id: projectId || null,
      version: 1,
      created_by: dbUser.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message, id: null };

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "created_document",
    entity_type: "document",
    entity_id: doc.id,
    metadata: { type: type || "livre" },
  });

  revalidatePath("/docs");
  redirect(`/docs/${doc.id}`);
}

export async function saveDocument(
  docId: string,
  updates: {
    title?: string;
    content?: string;
    type?: string;
    project_id?: string | null;
  }
) {
  const { supabase, dbUser, error: authError } = await getAuthUser();
  if (authError || !dbUser) return { error: authError };

  const { error } = await supabase
    .from("documents")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", docId);

  if (error) return { error: error.message };

  revalidatePath(`/docs/${docId}`);
  revalidatePath("/docs");
  return { error: null };
}

export async function deleteDocument(docId: string) {
  const { supabase, dbUser, error: authError } = await getAuthUser();
  if (authError || !dbUser) return { error: authError };

  // Delete versions first
  await supabase
    .from("document_versions")
    .delete()
    .eq("document_id", docId);

  // Delete activity log entries
  await supabase
    .from("activity_log")
    .delete()
    .eq("entity_type", "document")
    .eq("entity_id", docId);

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", docId);

  if (error) return { error: error.message };

  revalidatePath("/docs");
  redirect("/docs");
}

export async function getDocumentVersions(docId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("document_versions")
    .select("*, author:users!created_by(name)")
    .eq("document_id", docId)
    .order("version", { ascending: false });

  return data ?? [];
}

export async function restoreVersion(docId: string, versionId: string) {
  const { supabase, dbUser, error: authError } = await getAuthUser();
  if (authError || !dbUser) return { error: authError };

  const { data: version } = await supabase
    .from("document_versions")
    .select("title, content")
    .eq("id", versionId)
    .single();

  if (!version) return { error: "Versao nao encontrada" };

  const { error } = await supabase
    .from("documents")
    .update({
      title: version.title,
      content: version.content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", docId);

  if (error) return { error: error.message };

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "restored_document_version",
    entity_type: "document",
    entity_id: docId,
    metadata: {},
  });

  revalidatePath(`/docs/${docId}`);
  revalidatePath("/docs");
  return { error: null };
}
