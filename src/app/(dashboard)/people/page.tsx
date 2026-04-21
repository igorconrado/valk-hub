import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PeopleGrid } from "./people-grid";
import { InviteButton } from "./invite-button";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Pessoas" };

const PARTNERSHIP_ORDER: Record<string, number> = {
  founder_investor: 0,
  founder_operator: 1,
  employee: 2,
  advisor: 3,
};

export default async function PeoplePage() {
  const supabase = await createClient();
  const t = await getTranslations("people");

  const { data: users } = await supabase
    .from("users")
    .select(
      "id, name, email, role, company_role, avatar_url, dedication, areas, equity_percent, partnership_type, vesting_status, vesting_cliff_months, vesting_duration_months, vesting_start_date, joined_at"
    )
    .order("name");

  const userIds = (users ?? []).map((u) => u.id as string);

  // Fetch owned projects per user
  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id, name, logo_url, owner_id")
    .in("owner_id", userIds.length > 0 ? userIds : ["__none__"])
    .eq("status", "active");

  const ownedMap = new Map<string, { id: string; name: string; logo_url: string | null }[]>();
  for (const p of ownedProjects ?? []) {
    const oid = p.owner_id as string;
    const list = ownedMap.get(oid) ?? [];
    list.push({ id: p.id as string, name: p.name as string, logo_url: p.logo_url as string | null });
    ownedMap.set(oid, list);
  }

  // Fetch recent decisions
  const { data: recentDecisions } = await supabase
    .from("decisions")
    .select("id, description, impact_level, decided_by")
    .order("created_at", { ascending: false })
    .limit(50);

  const decisionMap = new Map<string, { id: string; description: string; impact_level: string }[]>();
  for (const d of recentDecisions ?? []) {
    const decidedBy = (d.decided_by as string[]) ?? [];
    for (const uid of decidedBy) {
      const list = decisionMap.get(uid) ?? [];
      if (list.length < 3) {
        list.push({
          id: d.id as string,
          description: d.description as string,
          impact_level: (d.impact_level as string) ?? "low",
        });
        decisionMap.set(uid, list);
      }
    }
  }

  // Calculate vested percent per user
  const vestedMap = new Map<string, number>();
  for (const u of users ?? []) {
    const uid = u.id as string;
    try {
      const { data } = await supabase.rpc("calculate_vested_percent", { p_user_id: uid });
      vestedMap.set(uid, typeof data === "number" ? data : 0);
    } catch {
      vestedMap.set(uid, 0);
    }
  }

  const people = (users ?? []).map((u) => {
    const uid = u.id as string;
    return {
      id: uid,
      name: u.name as string,
      email: u.email as string,
      role: u.role as string,
      company_role: u.company_role as string | null,
      avatar_url: u.avatar_url as string | null,
      dedication: u.dedication as string | null,
      areas: ((u as Record<string, unknown>).areas as string[]) ?? [],
      equity_percent: (u as Record<string, unknown>).equity_percent as number | null,
      partnership_type: (u as Record<string, unknown>).partnership_type as string | null,
      vesting_status: (u as Record<string, unknown>).vesting_status as string | null,
      vested_percent: vestedMap.get(uid) ?? 0,
      joined_at: (u as Record<string, unknown>).joined_at as string | null,
      owned_projects: ownedMap.get(uid) ?? [],
      recent_decisions: decisionMap.get(uid) ?? [],
    };
  });

  // Sort: investors first, then operators, then employees — within group by equity desc
  people.sort((a, b) => {
    const aOrder = PARTNERSHIP_ORDER[a.partnership_type ?? "employee"] ?? 3;
    const bOrder = PARTNERSHIP_ORDER[b.partnership_type ?? "employee"] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (b.equity_percent ?? 0) - (a.equity_percent ?? 0);
  });

  return (
    <div className="fadeUp">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={<InviteButton />}
      />
      <PeopleGrid people={people} />
    </div>
  );
}
