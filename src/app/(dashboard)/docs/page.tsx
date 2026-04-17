import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { DocsContent } from "./docs-content";
import { NewDocButton } from "./new-doc-button";

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
    <div>
      <PageHeader
        title="Docs"
        description="Base de conhecimento da empresa"
        action={<NewDocButton />}
      />
      <div className="mt-6">
        <DocsContent
          docs={docs ?? []}
          projects={projects ?? []}
          users={users ?? []}
        />
      </div>
    </div>
  );
}
