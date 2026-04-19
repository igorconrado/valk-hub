"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Plus, Scale } from "lucide-react";
import { toast } from "sonner";
import {
  ValkDialog,
  ValkTextarea,
  ValkSelect,
  ValkCheckbox,
  Avatar,
} from "@/components/ds";
import { RoleGate } from "@/components/role-gate";
import { createDecision } from "@/app/(dashboard)/meetings/actions";

type Decision = {
  id: string;
  title: string;
  impact: string | null;
  decided_at: string | null;
  created_at: string;
  meeting_id: string | null;
  decided_by_user:
    | { id: string; name: string }
    | { id: string; name: string }[]
    | null;
};

type MeetingOption = { id: string; title: string };
type User = { id: string; name: string };

const impactConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Baixo", color: "#555" },
  medium: { label: "Médio", color: "#E8A840" },
  high: { label: "Alto", color: "#E86B6A" },
  critical: { label: "Crítico", color: "#E24B4A" },
};


function resolve<T>(val: T | T[] | null): T | null {
  if (val == null) return null;
  if (Array.isArray(val)) return val[0] ?? null;
  return val;
}

function CreateProjectDecisionDialog({
  projectId,
  meetings,
  users,
  children,
}: {
  projectId: string;
  meetings: MeetingOption[];
  users: User[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedDeciders, setSelectedDeciders] = useState<string[]>([]);
  const [impact, setImpact] = useState("medium");
  const [meetingId, setMeetingId] = useState("");

  function toggleDecider(id: string) {
    setSelectedDeciders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createDecision({
        meeting_id: (fd.get("meeting_id") as string) || null,
        project_id: projectId,
        title: fd.get("title") as string,
        impact: fd.get("impact") as string,
        decided_by_ids: selectedDeciders,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Decisão registrada");
      setOpen(false);
      setSelectedDeciders([]);
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {children}
      </span>

      <ValkDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar decisao"
        subtitle="Documente uma decisao para este produto"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="rounded-lg px-4 py-2.5 text-[12px] text-[#555] transition-colors hover:text-[#888]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="create-project-decision-form"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Registrar
            </button>
          </>
        }
      >
        <form id="create-project-decision-form" onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          <div>
            <label htmlFor="pdec-title" className="label">
              Descricao
            </label>
            <ValkTextarea
              name="title"
              required
              rows={3}
              placeholder="O que foi decidido?"
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="pdec-impact" className="label">
              Impacto
            </label>
            <ValkSelect
              name="impact"
              value={impact}
              onValueChange={setImpact}
              options={[
                { value: "low", label: "Baixo" },
                { value: "medium", label: "Medio" },
                { value: "high", label: "Alto" },
                { value: "critical", label: "Critico" },
              ]}
            />
          </div>

          <div>
            <label htmlFor="pdec-meeting" className="label">
              Reuniao
            </label>
            <ValkSelect
              name="meeting_id"
              value={meetingId}
              onValueChange={setMeetingId}
              options={[
                { value: "", label: "Nenhuma" },
                ...meetings.map((m) => ({ value: m.id, label: m.title })),
              ]}
            />
          </div>

          <div>
            <label className="label">Quem decidiu</label>
            <div className="space-y-1 rounded-lg border border-[#1A1A1A] bg-[#050505] p-2">
              {users.map((u) => {
                const selected = selectedDeciders.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleDecider(u.id)}
                    disabled={isPending}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors duration-150 ${
                      selected
                        ? "bg-white/[0.04]"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <ValkCheckbox
                      checked={selected}
                      onCheckedChange={() => toggleDecider(u.id)}
                      disabled={isPending}
                    />
                    <Avatar
                      user={{
                        name: u.name,
                        initials: u.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
                        color: "#555",
                      }}
                      size={20}
                    />
                    <span className="text-[13px] text-[#ccc]">
                      {u.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </ValkDialog>
    </>
  );
}

export function ProjectDecisionsTab({
  projectId,
  decisions,
  meetings,
  users,
}: {
  projectId: string;
  decisions: Decision[];
  meetings: MeetingOption[];
  users: User[];
}) {
  return (
    <div className="py-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#555]">
          {decisions.length} decisão{decisions.length !== 1 ? "ões" : ""}
        </span>
        <RoleGate allowed={["admin", "operator"]}>
          <CreateProjectDecisionDialog
            projectId={projectId}
            meetings={meetings}
            users={users}
          >
            <button className="flex items-center gap-1 rounded-lg border border-[#222] bg-transparent px-2.5 py-1 text-[11px] font-medium text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc]">
              <Plus size={12} strokeWidth={1.5} />
              Registrar decisão
            </button>
          </CreateProjectDecisionDialog>
        </RoleGate>
      </div>

      {decisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Scale size={28} strokeWidth={1.2} className="text-[#1A1A1A]" />
          <p className="mt-3 text-[13px] text-[#444]">
            Nenhuma decisão registrada pra esse produto.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {decisions.map((d) => {
            const imp =
              impactConfig[d.impact ?? "medium"] ?? impactConfig.medium;
            const decider = resolve(d.decided_by_user);
            const date = d.decided_at ?? d.created_at;

            return (
              <Link
                key={d.id}
                href={
                  d.meeting_id ? `/meetings/${d.meeting_id}` : "#"
                }
                className="flex items-center gap-3 border-b border-[#0F0F0F] py-3 transition-colors last:border-0 hover:bg-white/[0.02]"
              >
                <div className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#E24B4A]" />
                <span className="min-w-0 flex-1 truncate text-[13px] text-[#888]">
                  {d.title}
                </span>
                <span
                  className="shrink-0 rounded px-1.5 py-px text-[9px] font-medium"
                  style={{
                    backgroundColor: `${imp.color}10`,
                    color: imp.color,
                    border: `1px solid ${imp.color}20`,
                  }}
                >
                  {imp.label}
                </span>
                {decider && (
                  <Avatar
                    user={{
                      name: decider.name,
                      initials: decider.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
                      color: "#555",
                    }}
                    size={20}
                  />
                )}
                <span className="shrink-0 text-[11px] text-[#444]">
                  {format(new Date(date), "dd MMM", { locale: ptBR })}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
