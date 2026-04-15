import { PageHeader } from "@/components/page-header";
import { ProjectsGridSkeleton } from "./projects-grid";

export default function ProjectsLoading() {
  return (
    <div>
      <PageHeader
        title="Projetos"
        description="Tudo que a VALK está construindo"
      />
      <div className="mt-6">
        <ProjectsGridSkeleton />
      </div>
    </div>
  );
}
