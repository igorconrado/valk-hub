import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MeetingsList } from "./meetings-list";
import { NewMeetingButton } from "./new-meeting-button";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Reuniões" };

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

  const total = (upcoming?.length ?? 0) + (past?.length ?? 0);

  return (
    <div className="fadeUp">
      <PageHeader
        title="Reuniões"
        subtitle={`${total} reuniões registradas`}
        action={<NewMeetingButton />}
      />
      <MeetingsList upcoming={upcoming ?? []} past={past ?? []} />
    </div>
  );
}
