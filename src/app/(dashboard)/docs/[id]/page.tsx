import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentView } from "./document-view";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select(
      "*, author:users!created_by(id, name), project:projects!project_id(id, name)"
    )
    .eq("id", id)
    .single();

  if (!doc) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .order("name");

  return (
    <DocumentView
      doc={doc as any}
      projects={projects ?? []}
    />
  );
}
