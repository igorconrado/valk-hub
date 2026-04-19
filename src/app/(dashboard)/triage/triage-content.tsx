"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TriageHero, type TriageSummary } from "@/components/triage/TriageHero";
import { TriageFilterTabs, type TriageTabValue } from "@/components/triage/TriageFilterTabs";
import { TriageProductCard, type TriageProject } from "@/components/triage/TriageProductCard";
import { createClient } from "@/lib/supabase/client";

const GROUP_CONFIG: Record<string, { label: string; color: string; tagline: string }> = {
  scale: { label: "Escalar", color: "#10B981", tagline: "Tracao comprovada — dobrar aposta" },
  on_track: { label: "Manter", color: "#3B82F6", tagline: "Sinal moderado — continuar observando" },
  at_risk: { label: "Em risco", color: "#F59E0B", tagline: "Gate estagnado — decidir em janela" },
  kill: { label: "Janela de kill", color: "#E24B4A", tagline: "Sem tracao — decisao de matar" },
};

const GROUP_ORDER = ["scale", "on_track", "at_risk", "kill"];

export function TriageContent({
  summary,
  projects,
}: {
  summary: TriageSummary;
  projects: TriageProject[];
}) {
  const [filter, setFilter] = useState<TriageTabValue>("all");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const counts: Record<TriageTabValue, number> = {
    all: projects.length,
    scale: projects.filter((p) => p.triage_status === "scale").length,
    on_track: projects.filter((p) => p.triage_status === "on_track" || p.triage_status === "discovery" || p.triage_status === "mvp").length,
    at_risk: projects.filter((p) => p.triage_status === "at_risk").length,
    kill: projects.filter((p) => p.triage_status === "kill").length,
  };

  const filtered = filter === "all"
    ? projects
    : filter === "on_track"
      ? projects.filter((p) => ["on_track", "discovery", "mvp"].includes(p.triage_status))
      : projects.filter((p) => p.triage_status === filter);

  const groups = GROUP_ORDER
    .map((key) => {
      const items = key === "on_track"
        ? filtered.filter((p) => ["on_track", "discovery", "mvp"].includes(p.triage_status))
        : filtered.filter((p) => p.triage_status === key);
      return { key, ...GROUP_CONFIG[key], items };
    })
    .filter((g) => g.items.length > 0);

  function handleOpenCommittee() {
    startTransition(async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) { toast.error("Nao autenticado"); return; }

      const { data: dbUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single();
      if (!dbUser) { toast.error("Usuario nao encontrado"); return; }

      const { data: meeting, error } = await supabase
        .from("meetings")
        .insert({
          type: "biweekly",
          title: "Comite de triagem",
          date: new Date().toISOString(),
          status: "scheduled",
          created_by: dbUser.id,
        })
        .select("id")
        .single();

      if (error) { toast.error(error.message); return; }
      toast.success("Comite criado");
      router.push(`/meetings/${meeting.id}`);
    });
  }

  return (
    <div className="fadeUp space-y-8">
      <TriageHero summary={summary} onOpenCommittee={handleOpenCommittee} />
      <TriageFilterTabs value={filter} onChange={setFilter} counts={counts} />

      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="mb-4 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: group.color }} />
            <span className="font-display text-[22px] font-bold text-white">{group.label}</span>
            <span className="font-mono text-[12px] text-[#555]">
              {String(group.items.length).padStart(2, "0")}
            </span>
            <span className="ml-4 flex-1 border-b border-[#141414]" />
            <span className="font-mono text-[11px] italic text-[#555]">{group.tagline}</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {group.items.map((project) => (
              <TriageProductCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      ))}

      {projects.length === 0 && (
        <div className="py-20 text-center text-[13px] text-[#555]">
          Nenhum produto ativo para triagem.
        </div>
      )}
    </div>
  );
}
