import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { ReportsList } from "./reports-list";
import { NewReportButton } from "./new-report-button";

export default async function ReportsPage() {
  const supabase = await createClient();

  const [{ data: reports }, { data: projects }] = await Promise.all([
    supabase
      .from("reports")
      .select(
        "id, title, type, status, period_start, period_end, ai_generated, created_at, project:projects(name), author:users!created_by(name)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, name")
      .eq("status", "active")
      .order("name"),
  ]);

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Análises e resultados da empresa"
        action={<NewReportButton />}
      />
      <div className="mt-6">
        <ReportsList
          reports={(reports as any[]) ?? []}
          projects={projects ?? []}
        />
      </div>
    </div>
  );
}
