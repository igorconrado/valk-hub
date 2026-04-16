"use client";

import { useState, useTransition, useEffect } from "react";
import { Loader2, ArrowUpRight } from "lucide-react";
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
import { createTask } from "./actions";

type Project = { id: string; name: string };
type User = { id: string; name: string };

const taskTypes = [
  { value: "dev", label: "Dev" },
  { value: "task", label: "Task" },
  { value: "meeting_prep", label: "Reuniao" },
  { value: "research", label: "Pesquisa" },
  { value: "decision", label: "Decisao" },
];

const priorities = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];

const inputClass =
  "w-full rounded-lg border border-[#1A1A1A] bg-[#050505] px-3.5 py-2.5 text-[13px] text-[#ddd] placeholder-[#333] transition-all duration-200 focus:border-[#E24B4A] focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.06)]";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#444]";

export function CreateTaskDialog({
  children,
  defaultProjectId,
  projects: externalProjects,
  users: externalUsers,
}: {
  children: React.ReactNode;
  defaultProjectId?: string;
  projects?: Project[];
  users?: User[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState("task");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [projects, setProjects] = useState<Project[]>(externalProjects ?? []);
  const [users, setUsers] = useState<User[]>(externalUsers ?? []);
  const [linearSyncStatus, setLinearSyncStatus] = useState<
    "loading" | "synced" | "not_synced" | "none"
  >("none");

  // Fetch projects and users if not passed externally
  useEffect(() => {
    if (externalProjects && externalUsers) return;

    const supabase = createClient();

    async function fetchData() {
      if (!externalProjects) {
        const { data } = await supabase
          .from("projects")
          .select("id, name")
          .order("name");
        setProjects(data ?? []);
      }
      if (!externalUsers) {
        const { data } = await supabase
          .from("users")
          .select("id, name")
          .order("name");
        setUsers(data ?? []);
      }
    }

    if (open) fetchData();
  }, [open, externalProjects, externalUsers]);

  // Check Linear sync status when type=dev and project changes
  useEffect(() => {
    if (type !== "dev" || !projectId) {
      setLinearSyncStatus("none");
      return;
    }

    setLinearSyncStatus("loading");
    const supabase = createClient();

    supabase
      .from("linear_sync_config")
      .select("sync_enabled")
      .eq("project_id", projectId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.sync_enabled) {
          setLinearSyncStatus("synced");
        } else {
          setLinearSyncStatus("not_synced");
        }
      });
  }, [type, projectId]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createTask({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        type,
        project_id: projectId,
        assignee_id: formData.get("assignee_id") as string,
        priority: formData.get("priority") as string,
        due_date: formData.get("due_date") as string,
        tags: formData.get("tags") as string,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.synced) {
        toast.success("Task criada e sincronizada com o Linear");
      } else {
        toast.success("Task criada");
      }

      setOpen(false);
      resetForm();
    });
  }

  function resetForm() {
    setType("task");
    setProjectId(defaultProjectId ?? "");
    setLinearSyncStatus("none");
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-[460px] gap-0 rounded-[14px] border border-[#1A1A1A] bg-[#0A0A0A] p-0"
      >
        <div className="shrink-0 px-7 pt-7">
          <DialogHeader className="gap-1">
            <DialogTitle className="font-display text-[17px] font-semibold text-[#eee]">
              Nova task
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[#555]">
              Cria uma task para a equipe
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-4.5 overflow-y-auto px-7 py-5">
            {/* Titulo */}
            <div>
              <label htmlFor="title" className={labelClass}>
                Titulo *
              </label>
              <input
                id="title"
                name="title"
                required
                placeholder="Ex: Implementar autenticacao"
                disabled={isPending}
                className={inputClass}
              />
            </div>

            {/* Descricao */}
            <div>
              <label htmlFor="description" className={labelClass}>
                Descricao
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Detalhes da task..."
                disabled={isPending}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Tipo + Produto */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="type" className={labelClass}>
                  Tipo
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={isPending}
                  className={`${inputClass} appearance-none`}
                >
                  {taskTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {/* Linear sync indicators */}
                {type === "dev" && linearSyncStatus === "synced" && (
                  <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[#E24B4A]">
                    <ArrowUpRight size={10} strokeWidth={2} />
                    Sincroniza com o Linear
                  </p>
                )}
                {type === "dev" && linearSyncStatus === "not_synced" && (
                  <p className="mt-1.5 text-[10px] text-[#F59E0B]">
                    Produto sem Linear conectado. Task ficara so no sistema.
                  </p>
                )}
                {type === "dev" && !projectId && linearSyncStatus === "none" && (
                  <p className="mt-1.5 text-[10px] text-[#444]">
                    Selecione um produto para verificar sync
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="project_id" className={labelClass}>
                  Produto
                </label>
                <select
                  id="project_id"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
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

            {/* Responsavel + Prioridade */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="assignee_id" className={labelClass}>
                  Responsavel *
                </label>
                <select
                  id="assignee_id"
                  name="assignee_id"
                  required
                  disabled={isPending}
                  defaultValue=""
                  className={`${inputClass} appearance-none`}
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="priority" className={labelClass}>
                  Prioridade
                </label>
                <select
                  id="priority"
                  name="priority"
                  defaultValue="medium"
                  disabled={isPending}
                  className={`${inputClass} appearance-none`}
                >
                  {priorities.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Data limite + Tags */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="due_date" className={labelClass}>
                  Data limite
                </label>
                <input
                  id="due_date"
                  name="due_date"
                  type="date"
                  disabled={isPending}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="tags" className={labelClass}>
                  Tags
                </label>
                <input
                  id="tags"
                  name="tags"
                  placeholder="auth, api, urgente"
                  disabled={isPending}
                  className={inputClass}
                />
              </div>
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
