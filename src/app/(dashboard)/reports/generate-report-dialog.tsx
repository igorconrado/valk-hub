"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ValkDialog,
  ValkSelect,
  ValkInput,
  ValkToggle,
} from "@/components/ds";
import type { ValkSelectOption } from "@/components/ds";
import { useTranslations } from "next-intl";
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

const loadingMessages = [
  "Analisando dados...",
  "Gerando relatorio...",
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
  defaultProjectId,
}: {
  children: React.ReactNode;
  defaultProjectId?: string;
}) {
  const router = useRouter();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [projects, setProjects] = useState<Project[]>([]);
  const [type, setType] = useState("sprint");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
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
    setProjectId(defaultProjectId ?? "");
    setAiEnabled(true);
    setGenerating(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (requiresProject.includes(type) && !projectId) {
      toast.error("Selecione um produto para este tipo de relatorio");
      return;
    }

    const projectName =
      projects.find((p) => p.id === projectId)?.name ?? "";
    const typeLabel =
      reportTypes.find((t) => t.value === type)?.label ?? type;
    const title = projectName
      ? `${typeLabel} — ${projectName}`
      : `Relatorio ${typeLabel}`;

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
          toast.error(err.error ?? "Erro ao gerar relatorio");
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

          toast.success("Relatorio gerado com AI");
          setOpen(false);
          resetForm();
          router.push(`/reports/${result.id}`);
        });
      } catch {
        toast.error("Erro de conexao ao gerar relatorio");
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

        toast.success("Relatorio criado");
        setOpen(false);
        resetForm();
        router.push(`/reports/${result.id}`);
      });
    }
  }

  const typeOptions: ValkSelectOption[] = reportTypes.map((t) => ({
    value: t.value,
    label: t.label,
  }));

  const projectOptions: ValkSelectOption[] = [
    {
      value: "",
      label: requiresProject.includes(type)
        ? "Selecione um produto"
        : "Todos os produtos",
    },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {children}
      </span>

      <ValkDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("dialogs.generateReport")}
        subtitle="Configure o tipo e periodo do relatorio"
        footer={
          generating ? undefined : (
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
                form="generate-report-form"
                disabled={isPending}
                className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
              >
                {isPending && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                {aiEnabled && <span>✦</span>}
                Gerar relatorio
              </button>
            </>
          )
        }
      >
        {generating ? (
          <GeneratingOverlay />
        ) : (
          <form
            id="generate-report-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-4.5"
          >
            {/* Tipo */}
            <div>
              <label htmlFor="rpt-type" className="label">
                Tipo
              </label>
              <ValkSelect
                value={type}
                onValueChange={setType}
                options={typeOptions}
                disabled={isPending}
              />
            </div>

            {/* Produto */}
            <div>
              <label htmlFor="rpt-project" className="label">
                Produto
                {requiresProject.includes(type) && (
                  <span className="ml-1 text-[#E24B4A]">*</span>
                )}
              </label>
              <ValkSelect
                value={projectId}
                onValueChange={setProjectId}
                options={projectOptions}
                placeholder={
                  requiresProject.includes(type)
                    ? "Selecione um produto"
                    : "Todos os produtos"
                }
                disabled={isPending}
              />
            </div>

            {/* Periodo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rpt-start" className="label">
                  Inicio
                </label>
                <ValkInput
                  id="rpt-start"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div>
                <label htmlFor="rpt-end" className="label">
                  Fim
                </label>
                <ValkInput
                  id="rpt-end"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  disabled={isPending}
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
                  Analisa os dados e gera o relatorio automaticamente
                </p>
              </div>
              <ValkToggle
                checked={aiEnabled}
                onCheckedChange={setAiEnabled}
                disabled={isPending}
              />
            </div>
          </form>
        )}
      </ValkDialog>
    </>
  );
}
