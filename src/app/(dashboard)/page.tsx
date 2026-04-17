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
  let prevMrr = 0;
  let prevClients = 0;
  let hasMetrics = false;

  // Previous month boundary for comparison
  const now = new Date();
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    .toISOString()
    .split("T")[0];

  if (activeProjectIds.length > 0) {
    const [{ data: snapshots }, { data: prevSnapshots }] = await Promise.all([
      supabase
        .from("metrics_snapshots")
        .select("project_id, data_json")
        .in("project_id", activeProjectIds)
        .order("date", { ascending: false }),
      supabase
        .from("metrics_snapshots")
        .select("project_id, data_json")
        .in("project_id", activeProjectIds)
        .lte("date", prevMonthEnd)
        .order("date", { ascending: false }),
    ]);

    if (snapshots && snapshots.length > 0) {
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

    if (prevSnapshots && prevSnapshots.length > 0) {
      const seen = new Set<string>();
      for (const s of prevSnapshots) {
        const pid = s.project_id as string;
        if (seen.has(pid)) continue;
        seen.add(pid);
        const data = s.data_json as Record<string, number | null> | null;
        if (data?.mrr) prevMrr += data.mrr;
        if (data?.paying_customers) prevClients += data.paying_customers;
      }
    }
  }

  // Fetch company metrics (runway)
  const { data: companyMetrics } = await supabase
    .from("company_metrics")
    .select("runway_months, burn_rate, data_json")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cash =
    (companyMetrics?.data_json as Record<string, number | null> | null)?.cash ??
    null;
  const burnRate = companyMetrics?.burn_rate
    ? Number(companyMetrics.burn_rate)
    : null;
  const runwayMonths = companyMetrics?.runway_months
    ? Number(companyMetrics.runway_months)
    : cash && burnRate && burnRate > 0
      ? Math.round((cash / burnRate) * 10) / 10
      : null;

  // Fetch pending items from tasks + action_items
  type PendingItem = {
    id: string;
    title: string;
    due_date: string | null;
    source: "task" | "action_item";
    meeting_id: string | null;
  };

  let pendingItems: PendingItem[] = [];

  if (dbUserId) {
    const [{ data: tasks }, { data: actionItems }] = await Promise.all([
      supabase
        .from("tasks")
        .select("id, title, due_date")
        .eq("assignee_id", dbUserId)
        .not("status", "in", "(done,cancelled)")
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("action_items")
        .select("id, title, due_date, meeting_id")
        .eq("assignee_id", dbUserId)
        .eq("status", "pending")
        .order("due_date", { ascending: true, nullsFirst: false }),
    ]);

    const taskItems: PendingItem[] = (tasks ?? []).map((t) => ({
      id: t.id as string,
      title: t.title as string,
      due_date: t.due_date as string | null,
      source: "task" as const,
      meeting_id: null,
    }));

    const aiItems: PendingItem[] = (actionItems ?? []).map((a) => ({
      id: a.id as string,
      title: a.title as string,
      due_date: a.due_date as string | null,
      source: "action_item" as const,
      meeting_id: a.meeting_id as string | null,
    }));

    // Merge and sort: due_date ASC, nulls last
    pendingItems = [...taskItems, ...aiItems].sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
  }

  // Fetch recent decisions
  const { data: recentDecisions } = await supabase
    .from("decisions")
    .select("id, title, meeting_id, decided_at, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const normalizedDecisions = (recentDecisions ?? []).map((d) => ({
    id: d.id as string,
    title: d.title as string,
    meeting_id: d.meeting_id as string | null,
    date: (d.decided_at ?? d.created_at) as string,
  }));

  return (
    <DashboardContent
      userName={userName}
      projects={(projects as any) ?? []}
      activities={normalizedActivities}
      metrics={{
        totalMrr,
        totalClients,
        prevMrr,
        prevClients,
        runwayMonths,
        cash,
        burnRate,
        hasMetrics,
      }}
      pendingItems={pendingItems}
      recentDecisions={normalizedDecisions}
    />
  );
}
