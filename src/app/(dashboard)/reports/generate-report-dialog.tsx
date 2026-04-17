"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { createReport } from "./actions";

type Project = { id: string; name: string };

const reportTypes = [
  { value: "sprint", label: "Sprint" },
  { value: "monthly", label: "Mensal" },
  { value: "experiment", label: "Experimento" },
  { value: "quarterly", label: "Trimestral" },
  { value: "custom", label: "Personalizado" },
];

const requiresProject = ["sprint", "experiment"];

function getDefaultPeriod(type: string): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split("T")[0];

  switch (type) {
    case "sprint": {
      const start = new Date(now.getTime() - 14 * 86400000)
        .toISOString()
        .split("T")[0];
      return { start, end };
    }
    case "monthly": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      return { start, end };
    }
    case "quarterly": {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), qMonth, 1)
        .toISOString()
        .split("T")[0];
      return { start, end };
    }
    default:
      return { start: end, end };
  }
}

const inputClass =
  "w-full rounded-lg border border-[#1A1A1A] bg-[#050505] px-3.5 py-2.5 text-[13px] text-[#ddd] placeholder-[#333] transition-all duration-200 focus:border-[#E24B4A] focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.06)]";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#444]";

const loadingMessages = [
  "Analisando dados...",
  "Gerando relatório...",
  "Finalizando...",
];

function GeneratingOverlay() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#E24B4A]" />
        <span className="text-[18px] text-[#E24B4A]">✦</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="mt-5 text-[13px] text-[#888]"
        >
          {loadingMessages[msgIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function GenerateReportDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [projects, setProjects] = useState<Project[]>([]);
  const [type, setType] = useState("sprint");
  const [projectId, setProjectId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Fetch projects on open
  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from("projects")
      .select("id, name")
      .eq("status", "active")
      .order("name")
      .then(({ data }) => setProjects(data ?? []));
  }, [open]);

  // Auto-fill period when type changes
  useEffect(() => {
    const period = getDefaultPeriod(type);
    setPeriodStart(period.start);
    setPeriodEnd(period.end);
  }, [type]);

  function resetForm() {
    setType("sprint");
    setProjectId("");
    setAiEnabled(true);
    setGenerating(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (requiresProject.includes(type) && !projectId) {
      toast.error("Selecione um produto para este tipo de relatório");
      return;
    }

    const projectName =
      projects.find((p) => p.id === projectId)?.name ?? "";
    const typeLabel =
      reportTypes.find((t) => t.value === type)?.label ?? type;
    const title = projectName
      ? `${typeLabel} — ${projectName}`
      : `Relatório ${typeLabel}`;

    if (aiEnabled) {
      // Step 2: AI generation
      setGenerating(true);

      try {
        const res = await fetch("/api/reports/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            project_id: projectId || undefined,
            period_start: periodStart || undefined,
            period_end: periodEnd || undefined,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error ?? "Erro ao gerar relatório");
          setGenerating(false);
          return;
        }

        const { content_md, data_json } = await res.json();

        startTransition(async () => {
          const result = await createReport({
            title,
            type,
            project_id: projectId || null,
            period_start: periodStart || null,
            period_end: periodEnd || null,
            content: content_md,
            data_json: data_json ?? {},
            ai_generated: true,
          });

          if (result.error) {
            toast.error(result.error);
            setGenerating(false);
            return;
          }

          toast.success("Relatório gerado com AI");
          setOpen(false);
          resetForm();
          router.push(`/reports/${result.id}`);
        });
      } catch {
        toast.error("Erro de conexão ao gerar relatório");
        setGenerating(false);
      }
    } else {
      // No AI — create empty draft
      startTransition(async () => {
        const result = await createReport({
          title,
          type,
          project_id: projectId || null,
          period_start: periodStart || null,
          period_end: periodEnd || null,
          content: "",
          data_json: {},
          ai_generated: false,
        });

        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success("Relatório criado");
        setOpen(false);
        resetForm();
        router.push(`/reports/${result.id}`);
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-[460px] gap-0 rounded-[14px] border border-[#1A1A1A] bg-[#0A0A0A] p-0"
      >
        <div className="shrink-0 px-7 pt-7">
          <DialogHeader className="gap-1">
            <DialogTitle className="font-display text-[17px] font-semibold text-[#eee]">
              Gerar relatório
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[#555]">
              Configure o tipo e período do relatório
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        {generating ? (
          <GeneratingOverlay />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex max-h-[60vh] flex-col gap-4.5 overflow-y-auto px-7 py-5">
              {/* Tipo */}
              <div>
                <label htmlFor="rpt-type" className={labelClass}>
                  Tipo
                </label>
                <select
                  id="rpt-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={isPending}
                  className={`${inputClass} appearance-none`}
                >
                  {reportTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Produto */}
              <div>
                <label htmlFor="rpt-project" className={labelClass}>
                  Produto
                  {requiresProject.includes(type) && (
                    <span className="ml-1 text-[#E24B4A]">*</span>
                  )}
                </label>
                <select
                  id="rpt-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  required={requiresProject.includes(type)}
                  disabled={isPending}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">
                    {requiresProject.includes(type)
                      ? "Selecione um produto"
                      : "Todos os produtos"}
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Período */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="rpt-start" className={labelClass}>
                    Início
                  </label>
                  <input
                    id="rpt-start"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    disabled={isPending}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="rpt-end" className={labelClass}>
                    Fim
                  </label>
                  <input
                    id="rpt-end"
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    disabled={isPending}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* AI toggle */}
              <div className="flex items-center justify-between rounded-lg border border-[#1A1A1A] bg-[#050505] px-4 py-3">
                <div>
                  <p className="text-[13px] text-[#ccc]">
                    Gerar com AI{" "}
                    <span className="text-[#E24B4A]">✦</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#444]">
                    Analisa os dados e gera o relatório automaticamente
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAiEnabled(!aiEnabled)}
                  disabled={isPending}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
                    aiEnabled ? "bg-[#E24B4A]" : "bg-[#333]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
                      aiEnabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-[#141414] px-7 py-5">
              <div className="flex justify-end gap-2.5">
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
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
                >
                  {isPending && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  {aiEnabled && <span>✦</span>}
                  Gerar relatório
                </button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
