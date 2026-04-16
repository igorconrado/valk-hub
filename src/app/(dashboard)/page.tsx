import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let userName = "Usuário";
  if (authUser) {
    const { data: dbUser } = await supabase
      .from("users")
      .select("name")
      .eq("auth_id", authUser.id)
      .maybeSingle();
    if (dbUser) userName = dbUser.name;
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, phase, status, logo_url, owner:users!owner_id(name)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const { data: activities } = await supabase
    .from("activity_log")
    .select("id, action, entity_type, entity_id, metadata, created_at, user:users!user_id(name)")
    .order("created_at", { ascending: false })
    .limit(20);

  const normalizedActivities = (activities ?? []).map((a) => ({
    id: a.id as string,
    action: a.action as string,
    entity_type: a.entity_type as string | null,
    entity_id: a.entity_id as string | null,
    metadata: a.metadata as Record<string, string> | null,
    created_at: a.created_at as string,
    user: Array.isArray(a.user) ? a.user[0] : a.user,
  }));

  return (
    <DashboardContent
      userName={userName}
      projects={(projects as any) ?? []}
      activities={normalizedActivities}
    />
  );
}
