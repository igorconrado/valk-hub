import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ReportsList } from "./reports-list";
import { NewReportButton } from "./new-report-button";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Relatórios" };

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
      <PageHeader
        title="Relatórios"
        subtitle={`${total} relatórios gerados`}
        action={<NewReportButton />}
      />
      <ReportsList
        reports={(reports as any[]) ?? []}
        projects={projects ?? []}
      />
    </div>
  );
}
