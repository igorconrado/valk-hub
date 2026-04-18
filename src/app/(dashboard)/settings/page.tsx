import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { SettingsView } from "./settings-view";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: dbUser } = await supabase
    .from("users")
    .select("id, name, email, role, company_role, avatar_url")
    .eq("auth_id", authUser.id)
    .single();

  if (!dbUser) return null;

  const { data: settings } = await supabase
    .from("user_settings")
    .select("notification_preferences, default_task_view, timezone")
    .eq("user_id", dbUser.id)
    .maybeSingle();

  const defaultPrefs = {
    task_assigned: true,
    task_blocked: true,
    meeting_scheduled: true,
    meeting_reminder: true,
    decision_registered: true,
    action_item_assigned: true,
    report_published: true,
  };

  return (
    <div>
      <PageHeader title="Configurações" />
      <div className="mt-6">
        <SettingsView
          user={dbUser as any}
          notificationPreferences={
            (settings?.notification_preferences as Record<string, boolean>) ??
            defaultPrefs
          }
          defaultTaskView={
            (settings?.default_task_view as string) ?? "list"
          }
          timezone={(settings?.timezone as string) ?? "America/Sao_Paulo"}
        />
      </div>
    </div>
  );
}
