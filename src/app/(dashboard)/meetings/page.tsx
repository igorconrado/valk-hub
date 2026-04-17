import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { MeetingsList } from "./meetings-list";
import { NewMeetingButton } from "./new-meeting-button";

export default async function MeetingsPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from("meetings")
      .select(
        "id, title, type, status, scheduled_at, project:projects(name), meeting_participants(user_id, user:users(name))"
      )
      .gte("scheduled_at", now)
      .not("status", "in", '("completed","cancelled")')
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("meetings")
      .select(
        "id, title, type, status, scheduled_at, project:projects(name), meeting_participants(user_id, user:users(name))"
      )
      .or(`scheduled_at.lt.${now},status.in.("completed","cancelled")`)
      .order("scheduled_at", { ascending: false }),
  ]);

  return (
    <div>
      <PageHeader
        title="Reuniões"
        description="Atas, decisões e pendências"
        action={<NewMeetingButton />}
      />
      <div className="mt-6">
        <MeetingsList upcoming={upcoming ?? []} past={past ?? []} />
      </div>
    </div>
  );
}
