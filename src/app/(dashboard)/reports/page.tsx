import { createClient } from "@/lib/supabase/server";
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

  const total = (reports as any[])?.length ?? 0;

  return (
    <div className="fadeUp">
      <div className="flex items-end justify-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="display" style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>Relatórios</h1>
          <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "6px 0 0" }}>{total} relatórios gerados</p>
        </div>
        <NewReportButton />
      </div>
      <ReportsList
        reports={(reports as any[]) ?? []}
        projects={projects ?? []}
      />
    </div>
  );
}
