"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ValkDialog,
  ValkInput,
  ValkSelect,
  type ValkSelectOption,
} from "@/components/ds";
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
  const t = useTranslations();
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
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {children}
      </button>

      <ValkDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("dialogs.newDoc")}
        subtitle="Crie um documento para a base de conhecimento"
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
              type="button"
              disabled={isPending}
              onClick={() => {
                const form = document.getElementById("create-doc-form") as HTMLFormElement | null;
                form?.requestSubmit();
              }}
              className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Criar e editar
            </button>
          </>
        }
      >
        <form id="create-doc-form" onSubmit={handleSubmit} className="flex flex-col gap-4.5">
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
        </form>
      </ValkDialog>
    </>
  );
}
