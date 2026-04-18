"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban,
  CheckCircle,
  FileText,
  Rocket,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";

const STEP_KEYS = [
  "welcome",
  "projects",
  "tasks",
  "docs",
  "ready",
];

type Project = { id: string; name: string; phase: string };

const phaseLabels: Record<string, string> = {
  discovery: "Discovery",
  mvp: "MVP",
  validation: "Validação",
  traction: "Tração",
  scale: "Escala",
  paused: "Pausado",
  closed: "Encerrado",
};

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-[6px] rounded-full transition-all duration-300 ${
            i === current
              ? "w-5 bg-[#E24B4A]"
              : i < current
                ? "w-[6px] bg-[#E24B4A]/40"
                : "w-[6px] bg-[#222]"
          }`}
        />
      ))}
    </div>
  );
}

function StepWelcome({ firstName }: { firstName: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-1.5">
        <span className="font-display text-[18px] font-semibold tracking-[0.2em] text-white">
          VALK
        </span>
        <span className="inline-block h-[5px] w-[5px] rounded-full bg-[#E24B4A]" />
      </div>
      <h2 className="mt-6 font-display text-[24px] font-semibold text-white">
        Bem-vindo, {firstName}
      </h2>
      <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[#888]">
        Este é o hub de gestão da empresa. Aqui você acompanha projetos, tasks,
        documentos e decisões.
      </p>
    </div>
  );
}

function StepProjects({ projects }: { projects: Project[] }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#141414]">
        <FolderKanban size={24} strokeWidth={1.5} className="text-[#888]" />
      </div>
      <h2 className="mt-5 font-display text-[20px] font-semibold text-white">
        Seus projetos
      </h2>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#888]">
        Cada produto da VALK tem seu próprio espaço com tasks, docs e métricas.
      </p>
      {projects.length > 0 && (
        <div className="mt-5 flex w-full flex-col gap-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-[#141414] bg-[#0F0F0F] px-4 py-2.5"
            >
              <span className="text-[13px] font-medium text-[#ddd]">
                {p.name}
              </span>
              <span className="text-[10px] text-[#555]">
                {phaseLabels[p.phase] ?? p.phase}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepTasks() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#141414]">
        <CheckCircle size={24} strokeWidth={1.5} className="text-[#888]" />
      </div>
      <h2 className="mt-5 font-display text-[20px] font-semibold text-white">
        Tasks e prioridades
      </h2>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#888]">
        Tasks de dev sincronizam com o Linear. Tasks internas ficam aqui.
      </p>
      <p className="mt-3 rounded-lg border border-[#141414] bg-[#0F0F0F] px-4 py-2.5 text-[12px] text-[#666]">
        Dica: arraste tasks no kanban pra mudar status.
      </p>
    </div>
  );
}

function StepDocs() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#141414]">
        <FileText size={24} strokeWidth={1.5} className="text-[#888]" />
      </div>
      <h2 className="mt-5 font-display text-[20px] font-semibold text-white">
        Docs e decisões
      </h2>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#888]">
        Documentos vivem aqui — PRDs, specs, atas. Tudo versionado.
      </p>
      <p className="mt-3 rounded-lg border border-[#141414] bg-[#0F0F0F] px-4 py-2.5 text-[12px] text-[#666]">
        Decisões são registradas nas reuniões e aparecem no dashboard.
      </p>
    </div>
  );
}

function StepReady() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(226,75,74,0.08)]">
        <Rocket size={24} strokeWidth={1.5} className="text-[#E24B4A]" />
      </div>
      <h2 className="mt-5 font-display text-[20px] font-semibold text-white">
        Tudo pronto
      </h2>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#888]">
        Você está pronto. Qualquer dúvida, o dashboard mostra tudo que está
        acontecendo.
      </p>
    </div>
  );
}

export function OnboardingWizard() {
  const { user } = useUser();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function check() {
      // Check if user has any onboarding progress
      const { data } = await supabase
        .from("onboarding_progress")
        .select("step_key")
        .eq("user_id", user!.id);

      const completedSteps = (data ?? []).map((d) => d.step_key as string);
      const allDone = STEP_KEYS.every((k) => completedSteps.includes(k));

      if (!allDone && completedSteps.length === 0) {
        // Fetch user's projects for step 2
        const { data: memberships } = await supabase
          .from("project_members")
          .select("project:projects!project_id(id, name, phase)")
          .eq("user_id", user!.id);

        const projs = (memberships ?? [])
          .map((m) => {
            const p = Array.isArray(m.project) ? m.project[0] : m.project;
            return p as Project | null;
          })
          .filter((p): p is Project => p !== null);

        setProjects(projs);
        setShow(true);
      }

      setLoading(false);
    }

    check();
  }, [user]);

  async function handleComplete() {
    if (!user) return;
    const supabase = createClient();

    await supabase.from("onboarding_progress").insert(
      STEP_KEYS.map((key) => ({
        user_id: user.id,
        step_key: key,
      }))
    );

    setShow(false);
  }

  if (loading || !show || !user) return null;

  const firstName = user.name.split(" ")[0];
  const isLast = step === STEP_KEYS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-lg rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-8"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && <StepWelcome firstName={firstName} />}
            {step === 1 && <StepProjects projects={projects} />}
            {step === 2 && <StepTasks />}
            {step === 3 && <StepDocs />}
            {step === 4 && <StepReady />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-lg px-4 py-2 text-[12px] text-[#555] transition-colors hover:text-[#888]"
              >
                Anterior
              </button>
            )}
          </div>

          <ProgressDots current={step} total={STEP_KEYS.length} />

          <div>
            {isLast ? (
              <button
                onClick={handleComplete}
                className="rounded-lg bg-[#E24B4A] px-5 py-2 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)]"
              >
                Começar
              </button>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                className="rounded-lg bg-white/[0.06] px-5 py-2 text-[12px] font-medium text-[#ccc] transition-colors hover:bg-white/[0.1]"
              >
                Próximo
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
