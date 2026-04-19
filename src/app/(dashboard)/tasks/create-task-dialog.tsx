"use client";

import { useState, useTransition, useEffect } from "react";
import { Loader2, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  ValkDialog,
  ValkInput,
  ValkTextarea,
  ValkSelect,
} from "@/components/ds";
import { createClient } from "@/lib/supabase/client";
import { createTask } from "./actions";

type Project = { id: string; name: string };
type User = { id: string; name: string };


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
  const tc = useTranslations("common");
  const tT = useTranslations("tasks.types");
  const tP = useTranslations("tasks.priorities");
  const t = useTranslations("tasks");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState("task");

  const taskTypes = [
    { value: "dev", label: tT("dev") },
    { value: "task", label: tT("task") },
    { value: "meeting_prep", label: tT("meeting_prep") },
    { value: "research", label: tT("research") },
    { value: "decision", label: tT("decision") },
    { value: "report", label: tT("report") },
    { value: "growth", label: tT("growth") },
    { value: "design", label: tT("design") },
    { value: "ops", label: tT("ops") },
  ];

  const priorities = [
    { value: "low", label: tP("low") },
    { value: "medium", label: tP("medium") },
    { value: "high", label: tP("high") },
    { value: "urgent", label: tP("urgent") },
  ];
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("medium");
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
    setAssigneeId("");
    setPriority("medium");
    setLinearSyncStatus("none");
  }

  function handleClose() {
    setOpen(false);
    resetForm();
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {children}
      </span>

      <ValkDialog
        open={open}
        onClose={handleClose}
        title={t("newTask")}
        subtitle="Cria uma task para a equipe"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="rounded-lg px-4 py-2.5 text-[12px] text-[#555] transition-colors hover:text-[#888]"
            >
              {tc("cancel")}
            </button>
            <button
              type="submit"
              form="create-task-form"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {tc("create")}
            </button>
          </>
        }
      >
        <form id="create-task-form" onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          {/* Titulo */}
          <div>
            <label htmlFor="title" className="label">
              Titulo *
            </label>
            <ValkInput
              id="title"
              name="title"
              required
              placeholder="Ex: Implementar autenticacao"
              disabled={isPending}
            />
          </div>

          {/* Descricao */}
          <div>
            <label htmlFor="description" className="label">
              Descricao
            </label>
            <ValkTextarea
              id="description"
              name="description"
              rows={3}
              placeholder="Detalhes da task..."
              disabled={isPending}
            />
          </div>

          {/* Tipo + Produto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tipo</label>
              <ValkSelect
                value={type}
                onValueChange={setType}
                options={taskTypes.map((t) => ({
                  value: t.value,
                  label: t.label,
                }))}
                disabled={isPending}
              />
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
              <label className="label">Produto</label>
              <ValkSelect
                name="project_id"
                value={projectId}
                onValueChange={setProjectId}
                options={[
                  { value: "", label: "Empresa (sem produto)" },
                  ...projects.map((p) => ({
                    value: p.id,
                    label: p.name,
                  })),
                ]}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Responsavel + Prioridade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Responsavel *</label>
              <ValkSelect
                name="assignee_id"
                value={assigneeId}
                onValueChange={setAssigneeId}
                placeholder="Selecione..."
                options={users.map((u) => ({
                  value: u.id,
                  label: u.name,
                }))}
                disabled={isPending}
              />
            </div>
            <div>
              <label className="label">Prioridade</label>
              <ValkSelect
                name="priority"
                value={priority}
                onValueChange={setPriority}
                options={priorities.map((p) => ({
                  value: p.value,
                  label: p.label,
                }))}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Data limite + Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="due_date" className="label">
                Data limite
              </label>
              <ValkInput
                id="due_date"
                name="due_date"
                type="date"
                disabled={isPending}
              />
            </div>
            <div>
              <label htmlFor="tags" className="label">
                Tags
              </label>
              <ValkInput
                id="tags"
                name="tags"
                placeholder="auth, api, urgente"
                disabled={isPending}
              />
            </div>
          </div>
        </form>
      </ValkDialog>
    </>
  );
}
