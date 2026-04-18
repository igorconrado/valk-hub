import { createClient } from "@/lib/supabase/server";
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

  const total = (upcoming?.length ?? 0) + (past?.length ?? 0);

  return (
    <div className="fadeUp">
      <div className="flex items-end justify-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="display" style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>Reuniões</h1>
          <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "6px 0 0" }}>{total} reuniões registradas</p>
        </div>
        <NewMeetingButton />
      </div>
      <MeetingsList upcoming={upcoming ?? []} past={past ?? []} />
    </div>
  );
}
