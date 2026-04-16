"use client";

import { motion } from "framer-motion";
import { FolderKanban } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { CreateProjectDialog } from "./create-project-dialog";

type Project = {
  id: string;
  name: string;
  phase: string;
  status: string;
  thesis_type: string | null;
  created_at: string;
  owner: { name: string } | null;
};

const phaseStyles: Record<string, { bg: string; text: string; border: string }> = {
  discovery: {
    bg: "rgba(59,130,246,0.06)",
    text: "#5B9BF0",
    border: "rgba(59,130,246,0.12)",
  },
  mvp: {
    bg: "rgba(245,158,11,0.06)",
    text: "#E8A840",
    border: "rgba(245,158,11,0.12)",
  },
  validation: {
    bg: "rgba(139,92,246,0.06)",
    text: "#A07EF0",
    border: "rgba(139,92,246,0.12)",
  },
  traction: {
    bg: "rgba(16,185,129,0.06)",
    text: "#3DC9A0",
    border: "rgba(16,185,129,0.12)",
  },
  scale: {
    bg: "rgba(226,75,74,0.06)",
    text: "#E86B6A",
    border: "rgba(226,75,74,0.12)",
  },
  paused: {
    bg: "rgba(107,114,128,0.06)",
    text: "#888",
    border: "rgba(107,114,128,0.12)",
  },
  closed: {
    bg: "rgba(55,65,81,0.06)",
    text: "#666",
    border: "rgba(55,65,81,0.12)",
  },
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

function PhaseBadge({ phase }: { phase: string }) {
  const style = phaseStyles[phase] ?? phaseStyles.paused;

  return (
    <span
      className="inline-flex rounded px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {phaseLabels[phase] ?? phase}
    </span>
  );
}

function ThesisBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex rounded border border-[#1A1A1A] bg-[#0F0F0F] px-2 py-0.5 text-[10px] font-medium text-[#555]">
      {type.toUpperCase()}
    </span>
  );
}

function OwnerAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[8px] font-semibold text-[#555]">
      {initials}
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const timeAgo = formatDistanceToNow(new Date(project.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: "easeOut",
      }}
    >
      <Link
        href={`/projects/${project.id}`}
        className="group block rounded-xl border border-[#141414] bg-[#0A0A0A] p-5 transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-px hover:border-[#1F1F1F] hover:[box-shadow:0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <h3 className="font-display text-[15px] font-semibold text-[#ddd] transition-colors duration-[250ms] group-hover:text-white">
          {project.name}
        </h3>

        <div className="mt-2.5 flex gap-1.5">
          <PhaseBadge phase={project.phase} />
          {project.thesis_type && <ThesisBadge type={project.thesis_type} />}
        </div>

        <div className="mt-3.5 flex items-center gap-1.5 text-[11px]">
          {project.owner && (
            <>
              <OwnerAvatar name={project.owner.name} />
              <span className="text-[#555]">{project.owner.name}</span>
              <span className="text-[#333]">·</span>
            </>
          )}
          <span className="text-[#333]">{timeAgo}</span>
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
      <FolderKanban size={40} strokeWidth={1} className="text-[#222]" />
      <p className="mt-4 text-[13px] text-[#555]">
        Nenhum produto no radar
      </p>
      <CreateProjectDialog>
        <button className="mt-4 rounded-lg bg-[#E24B4A] px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#C73E3D]">
          Criar primeiro produto
        </button>
      </CreateProjectDialog>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-[#141414] bg-[#0A0A0A] p-5"
        >
          <div className="h-4 w-32 rounded bg-[#141414]" />
          <div className="mt-3 flex gap-1.5">
            <div className="h-5 w-16 rounded bg-[#141414]" />
            <div className="h-5 w-10 rounded bg-[#141414]" />
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-[#141414]" />
            <div className="h-3 w-24 rounded bg-[#141414]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {projects.map((project, i) => (
        <ProjectCard key={project.id} project={project} index={i} />
      ))}
    </div>
  );
}

export { LoadingSkeleton as ProjectsGridSkeleton };
