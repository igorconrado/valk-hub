"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TriageHero, type TriageSummary } from "@/components/triage/TriageHero";
import { TriageFilterTabs, type TriageTabValue } from "@/components/triage/TriageFilterTabs";
import { TriageProductCard, type TriageProject } from "@/components/triage/TriageProductCard";
import { CommitteeActionButton } from "@/components/triage/CommitteeActionButton";

const GROUP_ORDER = ["scale", "on_track", "at_risk", "kill"];
const GROUP_COLORS: Record<string, string> = {
  scale: "#10B981",
  on_track: "#3B82F6",
  at_risk: "#F59E0B",
  kill: "#E24B4A",
};

export function TriageContent({
  summary,
  projects,
  activeCommittee,
}: {
  summary: TriageSummary;
  projects: TriageProject[];
  activeCommittee: { id: string; date: string; status: string } | null;
}) {
  const [filter, setFilter] = useState<TriageTabValue>("all");
  const tGroups = useTranslations("triage.groups");
  const tTaglines = useTranslations("triage.groupTaglines");

  const counts: Record<TriageTabValue, number> = {
    all: projects.length,
    scale: projects.filter((p) => p.triage_status === "scale").length,
    on_track: projects.filter((p) => ["on_track", "discovery", "mvp"].includes(p.triage_status)).length,
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
      return {
        key,
        label: tGroups(key as "scale"),
        color: GROUP_COLORS[key],
        tagline: tTaglines(key as "scale"),
        items,
      };
    })
    .filter((g) => g.items.length > 0);

  return (
    <div className="fadeUp space-y-8">
      <TriageHero
        summary={summary}
        committeeAction={<CommitteeActionButton activeCommittee={activeCommittee} />}
      />
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
