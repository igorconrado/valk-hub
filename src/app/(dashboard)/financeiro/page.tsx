import { createClient } from "@/lib/supabase/server";
import { FinanceiroContent } from "./financeiro-content";

export default async function FinanceiroPage() {
  const supabase = await createClient();

  const { data: history } = await supabase
    .from("company_metrics")
    .select("id, date, data_json, source, created_at")
    .order("date", { ascending: false })
    .limit(24);

  const normalized = (history ?? []).map((row) => {
    const data = row.data_json as Record<string, number | null> | null;
    return {
      id: row.id as string,
      date: row.date as string,
      cash: data?.current_cash ?? data?.cash ?? 0,
      burn: data?.monthly_burn ?? 0,
      runway: data?.runway_months ?? (data?.monthly_burn && data.monthly_burn > 0
        ? (data?.current_cash ?? data?.cash ?? 0) / data.monthly_burn
        : null),
      source: row.source as string,
    };
  });

  return <FinanceiroContent history={normalized} />;
}
