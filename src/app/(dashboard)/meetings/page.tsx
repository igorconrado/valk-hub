import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MeetingsList } from "./meetings-list";
import { NewMeetingButton } from "./new-meeting-button";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Reuniões" };

export default async function MeetingsPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [upcomingResponse, pastResponse] = await Promise.all([
    supabase
      .from("meetings")
      .select(
        "*, project:projects(name), meeting_participants(user_id, user:users(name))"
      )
      .gte("scheduled_at", now)
      .not("status", "in", ["completed", "cancelled"])
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("meetings")
      .select(
        "*, project:projects(name), meeting_participants(user_id, user:users(name))"
      )
      .or(`scheduled_at.lt.${now},status.in.(completed,cancelled)`)
      .order("scheduled_at", { ascending: false }),
  ]);

  if (upcomingResponse.error) {
    console.error("[Meetings Upcoming Error]:", upcomingResponse.error);
  }
  if (pastResponse.error) {
    console.error("[Meetings Past Error]:", pastResponse.error);
  }

  const upcoming = upcomingResponse.data ?? [];
  const past = pastResponse.data ?? [];
  const total = upcoming.length + past.length;

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
