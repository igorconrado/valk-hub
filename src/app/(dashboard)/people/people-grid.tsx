"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  last_activity_at: string | null;
};

const IMPACT_COLOR: Record<string, string> = {
  low: "#666",
  medium: "#3B82F6",
  high: "#F59E0B",
  critical: "#E24B4A",
};

function PersonCard({
  person,
  index,
  totalProjectCount,
}: {
  person: Person;
  index: number;
  totalProjectCount: number;
}) {
  const t = useTranslations("people");

  const initials = person.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Partnership type chip
  const partnershipLabel =
    person.partnership_type &&
    ["founder_operator", "founder_investor"].includes(person.partnership_type)
      ? t(`partnershipType.${person.partnership_type}` as "partnershipType.founder_operator")
      : null;

  // Activity signal
  const lastActivity = person.last_activity_at
    ? new Date(person.last_activity_at)
    : null;
  const isActiveRecently =
    lastActivity && Date.now() - lastActivity.getTime() < 24 * 60 * 60 * 1000;
  const activityLabel = lastActivity
    ? `Ativo há ${formatDistanceToNowStrict(lastActivity, { locale: ptBR })}`
    : "Sem atividade registrada";

  // Only show ownership if user owns a subset of projects, not all
  const showOwnership =
    person.owned_projects.length > 0 &&
    person.owned_projects.length < totalProjectCount;

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
            user={{
              name: person.name,
              initials,
              color: "#555",
              avatar_url: person.avatar_url,
            }}
            size={48}
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-[18px] font-semibold text-white">
              {person.name}
            </h3>
            {person.company_role && (
              <p className="mt-0.5 truncate text-[12px] text-[#888]">
                {person.company_role}
              </p>
            )}
          </div>
        </div>

        {/* Area tags + partnership type chip */}
        {(person.areas.length > 0 || partnershipLabel) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {person.areas.map((area) => (
              <span
                key={area}
                className="rounded-md border border-[#1F1F1F] bg-[#141414] px-2 py-0.5 text-[10px] text-[#AAA]"
              >
                {t(`areas.${area}` as "areas.tech")}
              </span>
            ))}
            {partnershipLabel && (
              <span className="rounded-md border border-[var(--border-default)] bg-transparent px-2 py-0.5 text-[10px] text-[#888]">
                {partnershipLabel}
              </span>
            )}
          </div>
        )}

        <div className="border-t border-[#141414]" />

        {/* Activity signal */}
        <div
          suppressHydrationWarning
          className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]"
        >
          {isActiveRecently && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--success)]" />
          )}
          <span>{activityLabel}</span>
        </div>

        {/* Owned projects (only if subset) */}
        {showOwnership && (
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
                  <ProjectLogo
                    name={project.name}
                    logoUrl={project.logo_url}
                    size={16}
                    fontSize={8}
                  />
                  <span className="text-[11px] text-[#AAA]">
                    {project.name}
                  </span>
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
                    style={{
                      backgroundColor: IMPACT_COLOR[d.impact_level] ?? "#666",
                    }}
                  />
                  <span className="line-clamp-1 text-[12px] text-[#888]">
                    {d.description}
                  </span>
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

export function PeopleGrid({
  people,
  totalProjectCount,
}: {
  people: Person[];
  totalProjectCount: number;
}) {
  if (people.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {people.map((person, i) => (
        <PersonCard
          key={person.id}
          person={person}
          index={i}
          totalProjectCount={totalProjectCount}
        />
      ))}
    </div>
  );
}
