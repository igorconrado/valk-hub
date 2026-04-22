import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MeetingView } from "./meeting-view";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select(
      "*, project:projects!meetings_project_id_fkey(id, name), meeting_participants(user_id, role, user:users(id, name, company_role))"
    )
    .eq("id", id)
    .maybeSingle();

  if (meetingError) {
    console.error("[meeting-detail] error:", meetingError.message, meetingError.code);
  }

  if (!meeting) notFound();

  const [
    { data: decisions },
    { data: actionItems },
    { data: users },
    { data: projects },
  ] = await Promise.all([
    supabase
      .from("decisions")
      .select("*, decided_by_user:users!decided_by(id, name)")
      .eq("meeting_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("action_items")
      .select("*, assignee:users!assignee_id(id, name)")
      .eq("meeting_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("users").select("id, name, company_role").order("name"),
    supabase.from("projects").select("id, name").order("name"),
  ]);

  return (
    <MeetingView
      meeting={meeting as any}
      decisions={decisions ?? []}
      actionItems={actionItems ?? []}
      users={users ?? []}
      projects={projects ?? []}
    />
  );
}
