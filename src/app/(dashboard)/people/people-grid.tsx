"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ds";
import { ProjectLogo } from "@/components/project-logo";

type Person = {
  id: string;
  name: string;
  email: string;
  role: string;
  company_role: string | null;
  avatar_url: string | null;
  dedication: string | null;
  areas: string[];
  equity_percent: number | null;
  partnership_type: string | null;
  vesting_status: string | null;
  vested_percent: number;
  joined_at: string | null;
  owned_projects: { id: string; name: string; logo_url: string | null }[];
  recent_decisions: { id: string; description: string; impact_level: string }[];
};

const IMPACT_COLOR: Record<string, string> = {
  low: "#666",
  medium: "#3B82F6",
  high: "#F59E0B",
  critical: "#E24B4A",
};

function VestingProgress({
  vested,
  total,
  status,
  statusLabel,
}: {
  vested: number;
  total: number;
  status: string;
  statusLabel: string;
}) {
  const pct = total > 0 ? (vested / total) * 100 : 0;
  const color =
    status === "cliff"
      ? "#F59E0B"
      : status === "fully_vested"
        ? "#10B981"
        : "#3B82F6";

  return (
    <div className="mt-1.5 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#666]">{statusLabel}</span>
        <span className="font-mono text-[10px]" style={{ color }}>
          {vested.toFixed(1)}%
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#141414]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function PersonCard({ person, index }: { person: Person; index: number }) {
  const t = useTranslations("people");

  const initials = person.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        href={`/people/${person.id}`}
        className="group flex flex-col gap-4 rounded-xl border border-[#141414] bg-[#0A0A0A] p-5 transition hover:-translate-y-0.5 hover:border-[#2A2A2A]"
      >
        {/* Identity */}
        <div className="flex items-center gap-3">
          <Avatar
            user={{ name: person.name, initials, color: "#555", avatar_url: person.avatar_url }}
            size={48}
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-[18px] font-semibold text-white">
              {person.name}
            </h3>
            {person.company_role && (
              <p className="mt-0.5 truncate text-[12px] text-[#888]">{person.company_role}</p>
            )}
          </div>
        </div>

        {/* Area tags + dedication */}
        {(person.areas.length > 0 || person.dedication) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {person.areas.map((area) => (
              <span
                key={area}
                className="rounded-md border border-[#1F1F1F] bg-[#141414] px-2 py-0.5 text-[10px] text-[#AAA]"
              >
                {t(`areas.${area}` as "areas.tech")}
              </span>
            ))}
            {person.dedication && (
              <span className="rounded-md border border-[#1F1F1F] bg-transparent px-2 py-0.5 text-[10px] text-[#666]">
                {t(`dedication.${person.dedication}` as "dedication.full_time")}
              </span>
            )}
          </div>
        )}

        <div className="border-t border-[#141414]" />

        {/* Equity + vesting */}
        {person.equity_percent != null && (
          <div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#444]">
                {t("equityLabel")}
              </span>
              {person.partnership_type && (
                <span className="text-[11px] text-[#666]">
                  {t(`partnershipType.${person.partnership_type}` as "partnershipType.founder_operator")}
                </span>
              )}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display text-[24px] font-bold text-white">
                {Number(person.equity_percent).toFixed(0)}%
              </span>
            </div>
            {person.vesting_status && person.vesting_status !== "not_applicable" && (
              <VestingProgress
                vested={person.vested_percent}
                total={Number(person.equity_percent)}
                status={person.vesting_status}
                statusLabel={t(`vesting.${person.vesting_status}` as "vesting.cliff")}
              />
            )}
            {person.vesting_status === "not_applicable" && (
              <p className="mt-1 text-[10px] text-[#555]">{t("vesting.not_applicable")}</p>
            )}
          </div>
        )}

        {/* Owned projects */}
        {person.owned_projects.length > 0 && (
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#444]">
              {t("ownerOf")}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {person.owned_projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-1.5 rounded-md bg-[#141414] px-2 py-1"
                >
                  <ProjectLogo name={project.name} logoUrl={project.logo_url} size={16} fontSize={8} />
                  <span className="text-[11px] text-[#AAA]">{project.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent decisions */}
        {person.recent_decisions.length > 0 && (
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#444]">
              {t("recentDecisions")}
            </p>
            <ul className="space-y-1.5">
              {person.recent_decisions.slice(0, 3).map((d) => (
                <li key={d.id} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: IMPACT_COLOR[d.impact_level] ?? "#666" }}
                  />
                  <span className="line-clamp-1 text-[12px] text-[#888]">{d.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

function EmptyState() {
  const t = useTranslations("people");
  return (
    <motion.div
      className="flex flex-col items-center py-20"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Users size={40} strokeWidth={1} className="text-[#222]" />
      <p className="mt-4 text-[13px] text-[#555]">{t("noMembers")}</p>
    </motion.div>
  );
}

export function PeopleGrid({ people }: { people: Person[] }) {
  if (people.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {people.map((person, i) => (
        <PersonCard key={person.id} person={person} index={i} />
      ))}
    </div>
  );
}
