"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FolderKanban, Plus, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { CreateProjectDialog } from "./create-project-dialog";
import { ProjectLogo } from "@/components/project-logo";
import { Avatar, PhaseBadge, type Phase } from "@/components/ds";

type Project = {
  id: string;
  name: string;
  description: string | null;
  phase: string;
  status: string;
  thesis_type: string | null;
  logo_url: string | null;
  created_at: string;
  owner: { name: string } | null;
};

const phaseLabels: Record<string, string> = {
  all: "Todos",
  discovery: "Discovery",
  mvp: "MVP",
  validation: "Validação",
  traction: "Tração",
  scale: "Escala",
  paused: "Pausado",
};

const validPhases: Phase[] = ["discovery", "mvp", "validation", "traction", "scale", "paused"];
const filterPhases = ["all", ...validPhases];

function makeAvatarUser(name: string) {
  return {
    name,
    initials: name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
    color: "#555",
  };
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Link
        href={`/projects/${project.id}`}
        className="card hoverable block text-left"
        style={{ padding: 22, cursor: "pointer" }}
      >
        {/* Top: health + name + phase + more */}
        <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
          <div className="flex items-center" style={{ gap: 10 }}>
            <ProjectLogo name={project.name} logoUrl={project.logo_url} size={32} fontSize={14} />
            <h3
              className="display"
              style={{ fontSize: 19, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}
            >
              {project.name}
            </h3>
            {validPhases.includes(project.phase as Phase) && (
              <PhaseBadge phase={project.phase as Phase} />
            )}
          </div>
          <button
            className="btn icon subtle"
            onClick={(e) => e.preventDefault()}
          >
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* Description */}
        {project.description && (
          <p
            style={{
              fontSize: 12.5,
              color: "var(--text-secondary)",
              margin: "0 0 16px",
              lineHeight: 1.55,
            }}
          >
            {project.description.length > 100
              ? project.description.slice(0, 100) + "..."
              : project.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 18 }}>
          {project.thesis_type && (
            <span className="badge neutral">
              {project.thesis_type.toUpperCase()}
            </span>
          )}
        </div>

        {/* Footer: owner + meta */}
        <div
          className="flex items-center justify-between"
          style={{ paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center" style={{ gap: 8 }}>
            {project.owner && (
              <>
                <Avatar user={makeAvatarUser(project.owner.name)} size={22} />
                <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>
                  {project.owner.name}
                </span>
              </>
            )}
          </div>
          <span
            suppressHydrationWarning
            className="mono"
            style={{ fontSize: 10.5, color: "var(--text-ghost)" }}
          >
            {formatDistanceToNow(new Date(project.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
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
      <FolderKanban size={40} strokeWidth={1} style={{ color: "var(--text-invisible)" }} />
      <p style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>
        Nenhum produto no radar
      </p>
      <CreateProjectDialog>
        <button className="btn primary" style={{ marginTop: 16 }}>
          Criar primeiro produto
        </button>
      </CreateProjectDialog>
    </motion.div>
  );
}

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.phase === filter);

  const activeCount = projects.filter((p) => p.status === "active").length;
  const pausedCount = projects.filter((p) => p.phase === "paused").length;

  return (
    <div className="fadeUp">
      {/* Header */}
      <div className="flex items-end justify-between" style={{ marginBottom: 28 }}>
        <div>
          <h1
            className="display"
            style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}
          >
            Projetos
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "6px 0 0" }}>
            {projects.length} produtos · {activeCount} ativos · {pausedCount} pausados
          </p>
        </div>
        <CreateProjectDialog>
          <button className="btn primary">
            <Plus size={13} strokeWidth={2.5} />
            Novo produto
          </button>
        </CreateProjectDialog>
      </div>

      {/* Phase filter chips */}
      <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 22 }}>
        {filterPhases.map((ph) => (
          <button
            key={ph}
            onClick={() => setFilter(ph)}
            style={{
              padding: "5px 11px",
              fontSize: 11.5,
              fontWeight: 500,
              borderRadius: 6,
              border: "1px solid",
              borderColor: filter === ph ? "var(--border-hover)" : "var(--border-subtle)",
              background: filter === ph ? "rgba(255,255,255,0.03)" : "transparent",
              color: filter === ph ? "var(--text-primary)" : "var(--text-muted)",
              transition: "all 150ms",
            }}
          >
            {phaseLabels[ph] ?? ph}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))" }}
        >
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}

          {/* Ghost "new" card */}
          <CreateProjectDialog>
            <button
              className="card flex flex-col items-center justify-center text-center"
              style={{
                padding: 22,
                cursor: "pointer",
                border: "1px dashed var(--border-default)",
                background: "transparent",
                color: "var(--text-muted)",
                minHeight: 180,
                gap: 8,
                transition: "all 200ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.color = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-default)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              <Plus size={18} strokeWidth={1.5} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>Novo produto</span>
              <span style={{ fontSize: 10.5, color: "var(--text-ghost)" }}>
                começar um novo experimento
              </span>
            </button>
          </CreateProjectDialog>
        </div>
      )}
    </div>
  );
}

export function ProjectsGridSkeleton() {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="card"
          style={{ padding: 22, animation: "pulse 2s ease-in-out infinite" }}
        >
          <div className="h-4 w-32 rounded" style={{ background: "var(--border-subtle)" }} />
          <div className="mt-3 flex gap-1.5">
            <div className="h-5 w-16 rounded" style={{ background: "var(--border-subtle)" }} />
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full" style={{ background: "var(--border-subtle)" }} />
            <div className="h-3 w-24 rounded" style={{ background: "var(--border-subtle)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
