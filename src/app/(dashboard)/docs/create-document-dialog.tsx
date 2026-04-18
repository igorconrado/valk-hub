"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ValkDialog,
  ValkDialogContent,
  ValkDialogDescription,
  ValkDialogHeader,
  ValkDialogTitle,
  ValkDialogTrigger,
} from "@/components/ds";
import { ValkInput } from "@/components/ds";
import { ValkSelect, type ValkSelectOption } from "@/components/ds";
import { createClient } from "@/lib/supabase/client";
import { createDocument } from "./actions";

const docTypes: ValkSelectOption[] = [
  { value: "contexto", label: "Contexto" },
  { value: "prd", label: "PRD" },
  { value: "spec", label: "Spec" },
  { value: "aprendizado", label: "Aprendizado" },
  { value: "ata", label: "Ata" },
  { value: "template", label: "Template" },
  { value: "relatorio", label: "Relatorio" },
  { value: "livre", label: "Livre" },
];

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
  const [docType, setDocType] = useState("livre");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
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
        type: docType,
        project_id: projectId || null,
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

  const projectOptions: ValkSelectOption[] = [
    { value: "", label: "Empresa (sem produto)" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <ValkDialog open={open} onOpenChange={setOpen}>
      <ValkDialogTrigger>{children}</ValkDialogTrigger>
      <ValkDialogContent className="max-w-[420px]">
        <div className="shrink-0 px-7 pt-7">
          <ValkDialogHeader>
            <ValkDialogTitle>Novo documento</ValkDialogTitle>
            <ValkDialogDescription>
              Crie um documento para a base de conhecimento
            </ValkDialogDescription>
          </ValkDialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-4.5 overflow-y-auto px-7 py-5">
            <div>
              <label htmlFor="doc-title" className="label">
                Titulo *
              </label>
              <ValkInput
                id="doc-title"
                name="title"
                required
                placeholder="Ex: PRD do Vecto"
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Tipo</label>
                <ValkSelect
                  value={docType}
                  onValueChange={setDocType}
                  options={docTypes}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="label">Produto</label>
                <ValkSelect
                  value={projectId}
                  onValueChange={setProjectId}
                  options={projectOptions}
                  disabled={isPending}
                />
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
      </ValkDialogContent>
    </ValkDialog>
  );
}
