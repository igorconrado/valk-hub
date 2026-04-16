"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Pencil,
  Link as LinkIcon,
  CheckCircle,
  FileText,
  BarChart3,
  Scale,
  Clock,
  UserPlus,
  X,
} from "lucide-react";
import { RoleGate } from "@/components/role-gate";
import { EditProjectDialog } from "./edit-project-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";
import { AddMemberDialog } from "./add-member-dialog";
import { ProjectLogo } from "@/components/project-logo";

type Project = {
  id: string;
  name: string;
  description: string | null;
  phase: string;
  status: string;
  thesis_type: string | null;
  thesis_hypothesis: string | null;
  launch_target: string | null;
  logo_url: string | null;
  created_at: string;
  owner: { id: string; name: string } | null;
};

type Member = {
  role_in_project: string;
  user: { id: string; name: string; company_role: string | null } | null;
};

const phaseStyles: Record<string, { bg: string; text: string; border: string }> = {
  discovery: { bg: "rgba(59,130,246,0.06)", text: "#5B9BF0", border: "rgba(59,130,246,0.12)" },
  mvp: { bg: "rgba(245,158,11,0.06)", text: "#E8A840", border: "rgba(245,158,11,0.12)" },
  validation: { bg: "rgba(139,92,246,0.06)", text: "#A07EF0", border: "rgba(139,92,246,0.12)" },
  traction: { bg: "rgba(16,185,129,0.06)", text: "#3DC9A0", border: "rgba(16,185,129,0.12)" },
  scale: { bg: "rgba(226,75,74,0.06)", text: "#E86B6A", border: "rgba(226,75,74,0.12)" },
  paused: { bg: "rgba(107,114,128,0.06)", text: "#888", border: "rgba(107,114,128,0.12)" },
  closed: { bg: "rgba(55,65,81,0.06)", text: "#666", border: "rgba(55,65,81,0.12)" },
};

const phaseLabels: Record<string, string> = {
  discovery: "Discovery",
  mvp: "MVP",
  validation: "Validação",
  traction: "Tração",
  scale: "Escala",
  paused: "Pausado",
  closed: "Encerrado",
};

const tabs = [
  { id: "sprint", label: "Sprint", icon: LinkIcon, placeholder: "Linear conecta na Sprint 2" },
  { id: "tasks", label: "Tasks", icon: CheckCircle, placeholder: "Sprint 2 traz as tasks" },
  { id: "docs", label: "Docs", icon: FileText, placeholder: "Docs chegam na Sprint 2" },
  { id: "metrics", label: "Métricas", icon: BarChart3, placeholder: "Sem números ainda", sub: "Lança, mede, aprende" },
  { id: "decisions", label: "Decisões", icon: Scale, placeholder: "Decisões entram na Sprint 2" },
  { id: "history", label: "Histórico", icon: Clock, placeholder: "Histórico começa na primeira sprint" },
];

function Avatar({ name, size = 26 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[9px] font-semibold text-[#555]"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

type AvailableUser = {
  id: string;
  name: string;
  company_role: string | null;
};

export function ProjectDetail({
  project,
  members,
  availableUsers,
}: {
  project: Project;
  members: Member[];
  availableUsers: AvailableUser[];
}) {
  const [activeTab, setActiveTab] = useState("sprint");

  const timeAgo = formatDistanceToNow(new Date(project.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const phase = phaseStyles[project.phase] ?? phaseStyles.paused;
  const activeTabData = tabs.find((t) => t.id === activeTab)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-[12px]">
        <Link
          href="/projects"
          className="font-medium text-[#444] transition-colors hover:text-[#888]"
        >
          Produtos
        </Link>
        <span className="text-[#333]">/</span>
        <span className="font-medium text-[#ccc]">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <ProjectLogo name={project.name} logoUrl={project.logo_url} size={56} fontSize={22} />
          <div>
            <h1 className="font-display text-[24px] font-semibold tracking-tight text-[#eee]">
              {project.name}
            </h1>

          <div className="mt-2.5 flex items-center gap-2 text-[12px]">
            <span
              className="inline-flex rounded px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: phase.bg,
                color: phase.text,
                border: `1px solid ${phase.border}`,
              }}
            >
              {phaseLabels[project.phase] ?? project.phase}
            </span>

            {project.thesis_type && (
              <span className="inline-flex rounded border border-[#1A1A1A] bg-[#0F0F0F] px-2 py-0.5 text-[10px] font-medium text-[#555]">
                {project.thesis_type.toUpperCase()}
              </span>
            )}

            {project.owner && (
              <>
                <span className="text-[#222]">·</span>
                <span className="text-[#555]">
                  por {project.owner.name}
                </span>
              </>
            )}

            <span className="text-[#222]">·</span>
            <span className="text-[#444]">{timeAgo}</span>
          </div>
          </div>
        </div>

        <RoleGate allowed={["admin", "operator"]}>
          <EditProjectDialog project={project}>
            <button className="flex items-center gap-1.5 rounded-lg border border-[#1F1F1F] bg-transparent px-3 py-1.5 text-[12px] text-[#666] transition-all duration-150 hover:border-[#2A2A2A] hover:bg-white/[0.02] hover:text-[#ccc]">
              <Pencil size={13} strokeWidth={1.5} />
              Editar
            </button>
          </EditProjectDialog>
        </RoleGate>
      </div>

      {/* Hypothesis */}
      {project.thesis_hypothesis && (
        <div className="mt-4 rounded-[10px] border border-[#141414] bg-[#0A0A0A] p-3.5">
          <p className="text-[13px] italic text-[#777]">
            &ldquo;{project.thesis_hypothesis}&rdquo;
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-7 border-b border-[#141414]">
        <div className="-mb-px overflow-x-auto pr-5 [-ms-overflow-style:none] [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden md:overflow-x-visible md:pr-0">
          <div className="flex min-w-max gap-0.5 md:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap px-3.5 py-2.5 text-[12px] font-medium transition-colors duration-150 ${
                  activeTab === tab.id
                    ? "text-[#eee]"
                    : "text-[#444] hover:text-[#888]"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E24B4A]"
                    layoutId="tab-underline"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content placeholder */}
      <div className="flex min-h-[200px] flex-col items-center justify-center py-12">
        <activeTabData.icon
          size={28}
          strokeWidth={1.2}
          className="text-[#1A1A1A]"
        />
        <p className="mt-3 text-[13px] text-[#444]">
          {activeTabData.placeholder}
        </p>
        {"sub" in activeTabData && activeTabData.sub && (
          <p className="mt-1 text-[11px] text-[#333]">{activeTabData.sub}</p>
        )}
      </div>

      {/* Members */}
      <div className="mt-9">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#444]">
          Time
        </h3>

        <div className="mt-3 flex flex-col gap-1">
          {members.map((member) => {
            if (!member.user) return null;

            return (
              <div
                key={member.user.id}
                className="group flex items-center gap-2.5 rounded-lg px-1 py-1.5 transition-colors hover:bg-white/[0.02]"
              >
                <Avatar name={member.user.name} />
                <span className="text-[13px] text-[#ccc]">
                  {member.user.name}
                </span>
                <span className="rounded border border-[#1A1A1A] bg-[#0F0F0F] px-1.5 py-px text-[10px] text-[#555]">
                  {member.role_in_project}
                </span>
                <RoleGate allowed={["admin", "operator"]}>
                  <RemoveMemberDialog
                    projectId={project.id}
                    projectName={project.name}
                    userId={member.user.id}
                    memberName={member.user.name}
                  >
                    <button className="ml-auto hidden text-[#333] transition-colors hover:text-[#E24B4A] group-hover:block">
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </RemoveMemberDialog>
                </RoleGate>
              </div>
            );
          })}
        </div>

        <RoleGate allowed={["admin", "operator"]}>
          <AddMemberDialog projectId={project.id} availableUsers={availableUsers}>
            <button className="mt-3 flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-[12px] text-[#444] transition-colors hover:text-[#888]">
              <UserPlus size={14} strokeWidth={1.5} />
              Adicionar ao time
            </button>
          </AddMemberDialog>
        </RoleGate>
      </div>
    </motion.div>
  );
}
