"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ValkDialog,
  ValkDialogContent,
  ValkDialogDescription,
  ValkDialogHeader,
  ValkDialogTitle,
  ValkDialogTrigger,
  ValkInput,
  ValkTextarea,
  ValkSelect,
} from "@/components/ds";
import { createProject } from "./actions";
import { LogoUpload } from "@/components/logo-upload";

const phases = [
  { value: "discovery", label: "Discovery" },
  { value: "mvp", label: "MVP" },
  { value: "validation", label: "Validação" },
  { value: "traction", label: "Tração" },
  { value: "scale", label: "Escala" },
];

const thesisTypes = [
  { value: "b2c", label: "B2C" },
  { value: "b2b", label: "B2B" },
];

export function CreateProjectDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState("");
  const [phase, setPhase] = useState("discovery");
  const [thesisType, setThesisType] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createProject({
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        phase: formData.get("phase") as string,
        thesis_type: formData.get("thesis_type") as string,
        thesis_hypothesis: formData.get("thesis_hypothesis") as string,
        launch_target: formData.get("launch_target") as string,
        logo_url: logoUrl,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Produto criado. Bora.");
      setOpen(false);
      setLogoUrl("");
    });
  }

  return (
    <ValkDialog open={open} onOpenChange={setOpen}>
      <ValkDialogTrigger>{children}</ValkDialogTrigger>
      <ValkDialogContent className="max-w-[460px]">
        <div className="shrink-0 px-7 pt-7">
          <ValkDialogHeader>
            <ValkDialogTitle>
              Novo produto
            </ValkDialogTitle>
            <ValkDialogDescription>
              Adicione um novo produto ao portfólio da VALK
            </ValkDialogDescription>
          </ValkDialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-4.5 overflow-y-auto px-7 py-5">
            {/* Logo + Nome */}
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
              <LogoUpload
                value={logoUrl || null}
                onChange={setLogoUrl}
                projectId={`new-project`}
              />
              <div className="flex-1">
                <label htmlFor="name" className="label">
                  Nome
                </label>
                <ValkInput
                  id="name"
                  name="name"
                  required
                  placeholder="Ex: Vecto"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="label">
                Descrição
              </label>
              <ValkTextarea
                id="description"
                name="description"
                rows={3}
                disabled={isPending}
              />
            </div>

            {/* Fase + Tese */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="phase" className="label">
                  Fase
                </label>
                <ValkSelect
                  name="phase"
                  value={phase}
                  onValueChange={setPhase}
                  options={phases}
                  disabled={isPending}
                />
              </div>
              <div>
                <label htmlFor="thesis_type" className="label">
                  Tese
                </label>
                <ValkSelect
                  name="thesis_type"
                  value={thesisType}
                  onValueChange={setThesisType}
                  options={[{ value: "", label: "—" }, ...thesisTypes]}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Hipótese central */}
            <div>
              <label htmlFor="thesis_hypothesis" className="label">
                Hipótese central
              </label>
              <ValkTextarea
                id="thesis_hypothesis"
                name="thesis_hypothesis"
                rows={2}
                placeholder="O que você quer provar com esse produto?"
                disabled={isPending}
              />
            </div>

            {/* Data-alvo */}
            <div>
              <label htmlFor="launch_target" className="label">
                Data-alvo
              </label>
              <ValkInput
                id="launch_target"
                name="launch_target"
                type="date"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Sticky footer */}
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
                {isPending && <Loader2 size={14} className="animate-spin" />}
                Criar
              </button>
            </div>
          </div>
        </form>
      </ValkDialogContent>
    </ValkDialog>
  );
}
