import { createClient } from "@/lib/supabase/server";
import { DocsContent } from "./docs-content";

export default async function DocsPage() {
  const supabase = await createClient();

  const { data: docs } = await supabase
    .from("documents")
    .select(
      "*, author:users!created_by(id, name), project:projects!project_id(id, name)"
    )
    .order("updated_at", { ascending: false });

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .order("name");

  const { data: users } = await supabase
    .from("users")
    .select("id, name")
    .order("name");

  return (
    <DocsContent
      docs={docs ?? []}
      projects={projects ?? []}
      users={users ?? []}
    />
  );
}
