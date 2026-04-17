import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let userName = "Usuario";
  let dbUserId: string | null = null;
  if (authUser) {
    const { data: dbUser } = await supabase
      .from("users")
      .select("id, name")
      .eq("auth_id", authUser.id)
      .maybeSingle();
    if (dbUser) {
      userName = dbUser.name;
      dbUserId = dbUser.id;
    }
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

  // Fetch latest metrics snapshot per active project for MRR/clients rollup
  const activeProjectIds = (projects ?? []).map((p) => p.id as string);
  let totalMrr = 0;
  let totalClients = 0;
  let hasMetrics = false;

  if (activeProjectIds.length > 0) {
    // Get the most recent snapshot for each project using distinct on
    const { data: snapshots } = await supabase
      .from("metrics_snapshots")
      .select("project_id, data_json")
      .in("project_id", activeProjectIds)
      .order("date", { ascending: false });

    if (snapshots && snapshots.length > 0) {
      // Keep only the latest per project
      const seen = new Set<string>();
      for (const s of snapshots) {
        const pid = s.project_id as string;
        if (seen.has(pid)) continue;
        seen.add(pid);
        const data = s.data_json as Record<string, number | null> | null;
        if (data?.mrr) totalMrr += data.mrr;
        if (data?.paying_customers) totalClients += data.paying_customers;
      }
      if (seen.size > 0) hasMetrics = true;
    }
  }

  // Fetch pending tasks for logged-in user
  let pendingTasks: {
    id: string;
    title: string;
    due_date: string | null;
    status: string;
  }[] = [];

  if (dbUserId) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, due_date, status")
      .eq("assignee_id", dbUserId)
      .not("status", "in", "(done,cancelled)")
      .not("due_date", "is", null)
      .order("due_date", { ascending: true })
      .limit(5);

    pendingTasks = (tasks as typeof pendingTasks) ?? [];
  }

  return (
    <DashboardContent
      userName={userName}
      projects={(projects as any) ?? []}
      activities={normalizedActivities}
      metrics={{ totalMrr, totalClients, hasMetrics }}
      pendingTasks={pendingTasks}
    />
  );
}
