import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { ProjectsGrid } from "./projects-grid";
import { NewProjectButton } from "./new-project-button";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*, owner:users!owner_id(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Projetos"
        description="Tudo que a VALK está construindo"
        action={<NewProjectButton />}
      />
      <div className="mt-6">
        <ProjectsGrid projects={projects ?? []} />
      </div>
    </div>
  );
}
