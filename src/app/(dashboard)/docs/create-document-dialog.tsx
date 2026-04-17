"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { createClient } from "@/lib/supabase/client";
import { createDocument } from "./actions";

const docTypes = [
  { value: "contexto", label: "Contexto" },
  { value: "prd", label: "PRD" },
  { value: "spec", label: "Spec" },
  { value: "aprendizado", label: "Aprendizado" },
  { value: "ata", label: "Ata" },
  { value: "template", label: "Template" },
  { value: "relatorio", label: "Relatorio" },
  { value: "livre", label: "Livre" },
];

const inputClass =
  "w-full rounded-lg border border-[#1A1A1A] bg-[#050505] px-3.5 py-2.5 text-[13px] text-[#ddd] placeholder-[#333] transition-all duration-200 focus:border-[#E24B4A] focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.06)]";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#444]";

export function CreateDocumentDialog({
  children,
  defaultProjectId,
}: {
  children: React.ReactNode;
  defaultProjectId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from("projects")
      .select("id, name")
      .order("name")
      .then(({ data }) => setProjects(data ?? []));
  }, [open]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createDocument({
        title: fd.get("title") as string,
        type: fd.get("type") as string,
        project_id: (fd.get("project_id") as string) || null,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Documento criado");
      setOpen(false);
      if (result.id) router.push(`/docs/${result.id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-[420px] gap-0 rounded-[14px] border border-[#1A1A1A] bg-[#0A0A0A] p-0"
      >
        <div className="shrink-0 px-7 pt-7">
          <DialogHeader className="gap-1">
            <DialogTitle className="font-display text-[17px] font-semibold text-[#eee]">
              Novo documento
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[#555]">
              Crie um documento para a base de conhecimento
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-4.5 overflow-y-auto px-7 py-5">
            <div>
              <label htmlFor="doc-title" className={labelClass}>
                Titulo *
              </label>
              <input
                id="doc-title"
                name="title"
                required
                placeholder="Ex: PRD do Vecto"
                disabled={isPending}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="doc-type" className={labelClass}>
                  Tipo
                </label>
                <select
                  id="doc-type"
                  name="type"
                  defaultValue="livre"
                  disabled={isPending}
                  className={`${inputClass} appearance-none`}
                >
                  {docTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="doc-project" className={labelClass}>
                  Produto
                </label>
                <select
                  id="doc-project"
                  name="project_id"
                  defaultValue={defaultProjectId ?? ""}
                  disabled={isPending}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Empresa (sem produto)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

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
                Criar e editar
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
