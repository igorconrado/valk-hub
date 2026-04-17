import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReportView } from "./report-view";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("reports")
    .select(
      "*, project:projects(id, name), author:users!created_by(id, name)"
    )
    .eq("id", id)
    .single();

  if (!report) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .order("name");

  return (
    <ReportView report={report as any} projects={projects ?? []} />
  );
}
