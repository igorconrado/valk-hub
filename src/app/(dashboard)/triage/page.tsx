import { createClient } from "@/lib/supabase/server";
import { TriageContent } from "./triage-content";

export default async function TriagePage() {
  const supabase = await createClient();

  // Fetch triage summary
  let summary = {
    total_projects: 0,
    scale_count: 0,
    on_track_count: 0,
    at_risk_count: 0,
    kill_count: 0,
    paused_count: 0,
    mrr_scaling: 0,
    mrr_at_risk: 0,
    kill_rate_pct: 0,
    pending_decisions: 0,
  };

  try {
    const { data } = await supabase.rpc("get_triage_summary");
    if (data) {
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        summary = {
          total_projects: Number(row.total_projects ?? 0),
          scale_count: Number(row.scale_count ?? 0),
          on_track_count: Number(row.on_track_count ?? 0),
          at_risk_count: Number(row.at_risk_count ?? 0),
          kill_count: Number(row.kill_count ?? 0),
          paused_count: Number(row.paused_count ?? 0),
          mrr_scaling: Number(row.mrr_scaling ?? 0),
          mrr_at_risk: Number(row.mrr_at_risk ?? 0),
          kill_rate_pct: Number(row.kill_rate_pct ?? 0),
          pending_decisions: Number(row.pending_decisions ?? 0),
        };
      }
    }
  } catch {
    // RPC may not exist
  }

  // Fetch projects with triage info + latest MRR + gate
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, logo_url, phase, status, triage_status, triage_status_reason, owner:users!owner_id(name)")
    .eq("status", "active")
    .order("name");

  // Fetch latest MRR per project
  const { data: snapshots } = await supabase
    .from("metrics_snapshots")
    .select("project_id, data_json")
    .order("date", { ascending: false });

  const mrrMap = new Map<string, number>();
  if (snapshots) {
    for (const s of snapshots) {
      const pid = s.project_id as string;
      if (mrrMap.has(pid)) continue;
      const data = s.data_json as Record<string, number | null> | null;
      mrrMap.set(pid, data?.mrr ?? 0);
    }
  }

  // Fetch gates
  const { data: gates } = await supabase
    .from("project_gates")
    .select("project_id, threshold_label, metric_key, metric_label, gate_value, comparison, decision_deadline")
    .eq("is_active", true);

  const gateMap = new Map<string, {
    gate_label: string;
    gate_metric: string;
    gate_target: number;
    decision_deadline: string | null;
  }>();
  if (gates) {
    for (const g of gates) {
      gateMap.set(g.project_id as string, {
        gate_label: g.threshold_label as string,
        gate_metric: g.metric_label as string,
        gate_target: Number(g.gate_value ?? 0),
        decision_deadline: g.decision_deadline as string | null,
      });
    }
  }

  const enriched = (projects ?? []).map((p) => {
    const gate = gateMap.get(p.id as string);
    const mrr = mrrMap.get(p.id as string) ?? 0;
    return {
      id: p.id as string,
      name: p.name as string,
      logo_url: p.logo_url as string | null,
      phase: p.phase as string,
      triage_status: ((p as Record<string, unknown>).triage_status as string) ?? "on_track",
      triage_status_reason: ((p as Record<string, unknown>).triage_status_reason as string) ?? null,
      owner: Array.isArray(p.owner) ? p.owner[0] : p.owner,
      mrr,
      gate_label: gate?.gate_label ?? null,
      gate_metric: gate?.gate_metric ?? null,
      gate_current: mrr,
      gate_target: gate?.gate_target ?? null,
      decision_deadline: gate?.decision_deadline ?? null,
    };
  });

  // Fetch active committee
  let activeCommittee: { id: string; date: string; status: string } | null = null;

  const { data: inProgress } = await supabase
    .from("meetings")
    .select("id, date, status")
    .eq("is_triage_committee", true)
    .eq("status", "in_progress")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (inProgress) {
    activeCommittee = { id: inProgress.id as string, date: inProgress.date as string, status: inProgress.status as string };
  } else {
    const { data: nextScheduled } = await supabase
      .from("meetings")
      .select("id, date, status")
      .eq("is_triage_committee", true)
      .neq("status", "cancelled")
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextScheduled) {
      activeCommittee = { id: nextScheduled.id as string, date: nextScheduled.date as string, status: nextScheduled.status as string };
    }
  }

  return <TriageContent summary={summary} projects={enriched} activeCommittee={activeCommittee} />;
}
