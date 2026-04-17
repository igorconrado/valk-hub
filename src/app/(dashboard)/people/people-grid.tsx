"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import Link from "next/link";

type Person = {
  id: string;
  name: string;
  email: string;
  role: string;
  company_role: string | null;
  avatar_url: string | null;
  dedication: string | null;
  task_count: number;
  project_count: number;
};

const roleConfig: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "#E24B4A" },
  operator: { label: "Operator", color: "#3B82F6" },
  stakeholder: { label: "Stakeholder", color: "#888" },
};

const dedicationConfig: Record<string, { label: string; color: string }> = {
  full_time: { label: "Full-time", color: "#10B981" },
  partial: { label: "Parcial", color: "#F59E0B" },
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex rounded px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: `${color}14`,
        color,
        border: `1px solid ${color}20`,
      }}
    >
      {label}
    </span>
  );
}

function PersonAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="mx-auto h-16 w-16 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1A1A1A]">
      <span className="font-display text-[20px] font-semibold text-[#555]">
        {initials}
      </span>
    </div>
  );
}

function PersonCard({ person, index }: { person: Person; index: number }) {
  const roleCfg = roleConfig[person.role] ?? roleConfig.stakeholder;
  const dedCfg = person.dedication
    ? dedicationConfig[person.dedication]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        href={`/people/${person.id}`}
        className="group block rounded-xl border border-[#141414] bg-[#0A0A0A] p-6 text-center transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-px hover:border-[#1F1F1F] hover:[box-shadow:0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <PersonAvatar name={person.name} avatarUrl={person.avatar_url} />

        <h3 className="mt-3 font-display text-[16px] font-semibold text-[#eee] transition-colors duration-[250ms] group-hover:text-white">
          {person.name}
        </h3>

        {person.company_role && (
          <p className="mt-1 text-[12px] text-[#666]">
            {person.company_role}
          </p>
        )}

        <div className="mt-3 flex items-center justify-center gap-1.5">
          <Badge label={roleCfg.label} color={roleCfg.color} />
          {dedCfg && <Badge label={dedCfg.label} color={dedCfg.color} />}
        </div>

        <div className="my-4 h-px bg-[#141414]" />

        <div className="flex justify-around">
          <div>
            <p className="font-display text-[14px] font-semibold text-[#ddd]">
              {person.task_count}
            </p>
            <p className="text-[11px] text-[#555]">tasks</p>
          </div>
          <div>
            <p className="font-display text-[14px] font-semibold text-[#ddd]">
              {person.project_count}
            </p>
            <p className="text-[11px] text-[#555]">projetos</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center py-20"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Users size={40} strokeWidth={1} className="text-[#222]" />
      <p className="mt-4 text-[13px] text-[#555]">
        Nenhum membro no time ainda.
      </p>
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
