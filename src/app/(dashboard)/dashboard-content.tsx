"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  TrendingUp,
  Scale,
  CheckCircle,
} from "lucide-react";
import { ProjectLogo } from "@/components/project-logo";

type Project = {
  id: string;
  name: string;
  phase: string;
  status: string;
  logo_url: string | null;
  owner: { name: string } | null;
};

type Activity = {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, string> | null;
  created_at: string;
  user: { name: string } | null;
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function getFirstName(name: string): string {
  return name.split(" ")[0];
}

function getActionText(action: string, metadata: Record<string, string> | null): React.ReactNode {
  const projectName = metadata?.project_name || metadata?.name;
  const memberName = metadata?.member_name;

  switch (action) {
    case "created_project":
    case "project_created":
      return (
        <>
          criou o projeto <span className="text-[#ccc]">{projectName}</span>
        </>
      );
    case "updated_project":
      return (
        <>
          atualizou o projeto <span className="text-[#ccc]">{projectName}</span>
        </>
      );
    case "added_member":
      return (
        <>
          adicionou <span className="text-[#ccc]">{memberName}</span> ao projeto
        </>
      );
    case "removed_member":
      return (
        <>
          removeu <span className="text-[#ccc]">{memberName}</span> do projeto
        </>
      );
    default:
      return action;
  }
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#111] text-[9px] font-semibold text-[#444]">
      {initials}
    </div>
  );
}

const sectionLabel = "text-[10px] font-semibold uppercase tracking-[0.15em] text-[#333]";
const cardClass = "rounded-[10px] border border-[#141414] bg-[#0A0A0A] p-[18px_20px]";

export function DashboardContent({
  userName,
  projects,
  activities,
}: {
  userName: string;
  projects: Project[];
  activities: Activity[];
}) {
  const today = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div>
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-[24px] font-semibold tracking-[-0.01em] text-[#eee]">
          {getGreeting()}, {getFirstName(userName)}
        </h1>
        <p className="mt-1 text-[12px] capitalize text-[#444]">{today}</p>
      </motion.div>

      {/* Section 1 — Active projects */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className={sectionLabel}>Projetos ativos</h2>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {projects.map((project, i) => {
            const phase = phaseStyles[project.phase] ?? phaseStyles.paused;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.15 + i * 0.05 }}
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="group block min-h-[100px] rounded-[10px] border border-[#141414] bg-[#0A0A0A] px-[18px] py-4 transition-all duration-[250ms] hover:-translate-y-px hover:border-[#1F1F1F] hover:[box-shadow:0_6px_24px_rgba(0,0,0,0.3)]"
                >
                  <div className="flex items-center gap-1.5">
                    <ProjectLogo
                      name={project.name}
                      logoUrl={project.logo_url}
                      size={24}
                      fontSize={11}
                    />
                    <div className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#10B981] border border-[rgba(16,185,129,0.3)]" />
                    <span className="text-[13px] font-medium text-[#bbb] transition-colors group-hover:text-[#eee]">
                      {project.name}
                    </span>
                  </div>

                  <div className="mt-2">
                    <span
                      className="inline-flex rounded px-1.5 py-px text-[9px] font-medium"
                      style={{
                        backgroundColor: phase.bg,
                        color: phase.text,
                        border: `1px solid ${phase.border}`,
                      }}
                    >
                      {phaseLabels[project.phase] ?? project.phase}
                    </span>
                  </div>

                  {project.owner && (
                    <p className="mt-2 text-[10px] text-[#444]">
                      {project.owner.name}
                    </p>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Section 2 — Metrics, Decisions, Pending */}
      <motion.div
        className="mt-7"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Metrics */}
          <div className={cardClass}>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} strokeWidth={1.5} className="text-[#333]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#333]">
                Métricas
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-3.5">
              {[
                { label: "MRR", value: "R$ 0" },
                { label: "Clientes", value: "0" },
                { label: "Runway", value: "—" },
              ].map((m) => (
                <div key={m.label}>
                  <p className="text-[10px] text-[#444]">{m.label}</p>
                  <p className="font-mono text-[20px] font-semibold text-[#ddd]">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3.5 text-[10px] text-[#222]">
              Dados disponíveis em breve
            </p>
          </div>

          {/* Decisions */}
          <div className={cardClass}>
            <div className="flex items-center gap-1.5">
              <Scale size={14} strokeWidth={1.5} className="text-[#333]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#333]">
                Decisões
              </span>
            </div>
            <div className="mt-3 flex flex-col items-center py-6">
              <Scale size={20} strokeWidth={1.2} className="text-[#1A1A1A]" />
              <p className="mt-3 text-[11px] text-[#333]">
                Nenhuma decisão registrada
              </p>
            </div>
          </div>

          {/* Pending */}
          <div className={cardClass}>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} strokeWidth={1.5} className="text-[#333]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#333]">
                Action items
              </span>
            </div>
            <div className="mt-3 flex flex-col items-center py-6">
              <span className="text-[18px] text-[#222]">✓</span>
              <p className="mt-2 text-[11px] text-[#333]">Nada pendente</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 3 — Activity feed */}
      <motion.div
        className="mt-7"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <div className="rounded-[10px] border border-[#141414] bg-[#0A0A0A] p-[20px_22px]">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#333]">
            Atividade recente
          </h2>

          {activities.length === 0 ? (
            <p className="py-8 text-center text-[12px] text-[#333]">
              Nenhuma atividade ainda
            </p>
          ) : (
            <div className="mt-3.5">
              {activities.map((activity, i) => {
                const timeAgo = formatDistanceToNow(
                  new Date(activity.created_at),
                  { addSuffix: true, locale: ptBR }
                );

                return (
                  <div key={activity.id}>
                    {i > 0 && <div className="h-px bg-[#0F0F0F]" />}
                    <div className="flex items-center gap-2.5 py-2.5">
                      {activity.user && <Avatar name={activity.user.name} />}
                      <p className="min-w-0 flex-1 truncate text-[13px] text-[#888]">
                        {activity.user && (
                          <span className="font-medium text-[#999]">
                            {activity.user.name}{" "}
                          </span>
                        )}
                        {getActionText(activity.action, activity.metadata)}
                      </p>
                      <span className="shrink-0 text-[11px] text-[#333]">
                        {timeAgo}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
