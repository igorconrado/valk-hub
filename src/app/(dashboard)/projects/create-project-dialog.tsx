"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const inputClass =
  "w-full rounded-lg border border-[#1A1A1A] bg-[#050505] px-3.5 py-2.5 text-[13px] text-[#ddd] placeholder-[#333] transition-all duration-200 focus:border-[#E24B4A] focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.06)]";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#444]";

export function CreateProjectDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState("");

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-[460px] gap-0 rounded-[14px] border border-[#1A1A1A] bg-[#0A0A0A] p-0"
      >
        <div className="shrink-0 px-7 pt-7">
          <DialogHeader className="gap-1">
            <DialogTitle className="font-display text-[17px] font-semibold text-[#eee]">
              Novo produto
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[#555]">
              Adicione um novo produto ao portfólio da VALK
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-4.5 overflow-y-auto px-7 py-5">
            {/* Logo + Nome */}
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
              <LogoUpload
                value={logoUrl || null}
                onChange={setLogoUrl}
                projectId={`new-${Date.now()}`}
              />
              <div className="flex-1">
                <label htmlFor="name" className={labelClass}>
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  placeholder="Ex: Vecto"
                  disabled={isPending}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className={labelClass}>
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                disabled={isPending}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Fase + Tese */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="phase" className={labelClass}>
                  Fase
                </label>
                <select
                  id="phase"
                  name="phase"
                  defaultValue="discovery"
                  disabled={isPending}
                  className={`${inputClass} appearance-none`}
                >
                  {phases.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="thesis_type" className={labelClass}>
                  Tese
                </label>
                <select
                  id="thesis_type"
                  name="thesis_type"
                  defaultValue=""
                  disabled={isPending}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">—</option>
                  {thesisTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hipótese central */}
            <div>
              <label htmlFor="thesis_hypothesis" className={labelClass}>
                Hipótese central
              </label>
              <textarea
                id="thesis_hypothesis"
                name="thesis_hypothesis"
                rows={2}
                placeholder="O que você quer provar com esse produto?"
                disabled={isPending}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Data-alvo */}
            <div>
              <label htmlFor="launch_target" className={labelClass}>
                Data-alvo
              </label>
              <input
                id="launch_target"
                name="launch_target"
                type="date"
                disabled={isPending}
                className={inputClass}
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
      </DialogContent>
    </Dialog>
  );
}
