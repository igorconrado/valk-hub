"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ValkDialog,
  ValkInput,
  ValkTextarea,
  ValkSelect,
  ValkToggle,
} from "@/components/ds";
import {
  updateProject,
  deleteProject,
  getLinearTeams,
  connectLinearTeam,
  updateLinearSyncEnabled,
  disconnectLinear,
  saveStripeProductId,
} from "../actions";
import { LogoUpload } from "@/components/logo-upload";
import { RoleGate } from "@/components/role-gate";

type Project = {
  id: string;
  name: string;
  description: string | null;
  phase: string;
  status: string;
  thesis_type: string | null;
  thesis_hypothesis: string | null;
  launch_target: string | null;
  logo_url: string | null;
  stripe_product_id: string | null;
};

type LinearSyncConfig = {
  team_id: string;
  team_name: string;
  sync_enabled: boolean;
} | null;

const statuses = [
  { value: "active", label: "Ativo" },
  { value: "paused", label: "Pausado" },
  { value: "closed", label: "Encerrado" },
];

const phases = [
  { value: "discovery", label: "Discovery" },
  { value: "mvp", label: "MVP" },
  { value: "validation", label: "Validacao" },
  { value: "traction", label: "Tracao" },
  { value: "scale", label: "Escala" },
  { value: "paused", label: "Pausado" },
  { value: "closed", label: "Encerrado" },
];

const thesisTypes = [
  { value: "b2c", label: "B2C" },
  { value: "b2b", label: "B2B" },
];

function StripeSection({
  project,
  configured,
}: {
  project: Project;
  configured: boolean;
}) {
  const [stripeId, setStripeId] = useState(project.stripe_product_id ?? "");
  const [isSaving, startSaveTransition] = useTransition();

  function handleSave() {
    startSaveTransition(async () => {
      const result = await saveStripeProductId(project.id, stripeId || null);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Stripe Product ID salvo");
      }
    });
  }

  return (
    <div>
      <div className="mt-2 h-px bg-[#141414]" />
      <h3 className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-[#444]">
        Stripe
      </h3>

      {!configured ? (
        <div className="mt-3">
          <p className="text-[12px] leading-relaxed text-[#555]">
            Configure <span className="font-mono text-[11px] text-[#666]">STRIPE_SECRET_KEY</span> nas
            variaveis de ambiente para habilitar a sincronizacao automatica de
            metricas via Stripe.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2.5">
          <p className="text-[12px] leading-relaxed text-[#555]">
            Vincule o Product ID do Stripe para sincronizar MRR e clientes
            automaticamente.
          </p>
          <div className="flex gap-2">
            <ValkInput
              value={stripeId}
              onChange={(e) => setStripeId(e.target.value)}
              placeholder="prod_..."
              disabled={isSaving}
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="shrink-0 rounded-lg border border-[#222] bg-transparent px-3 py-[7px] text-[11px] font-medium text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc] disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                "Salvar"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function EditProjectDialog({
  project,
  children,
  linearConfig: initialLinearConfig,
  stripeConfigured = false,
}: {
  project: Project;
  children: React.ReactNode;
  linearConfig?: LinearSyncConfig;
  stripeConfigured?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState(project.logo_url ?? "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [isDeleting, startDeleteTransition] = useTransition();

  // Linear state
  const [linearConfig, setLinearConfig] = useState(initialLinearConfig ?? null);
  const [showTeamSelect, setShowTeamSelect] = useState(false);
  const [linearTeams, setLinearTeams] = useState<
    { id: string; name: string; key: string }[]
  >([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [linearPending, startLinearTransition] = useTransition();
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Controlled state for selects
  const [status, setStatus] = useState(project.status);
  const [phase, setPhase] = useState(project.phase);
  const [thesisType, setThesisType] = useState(project.thesis_type ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProject({
        id: project.id,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        status: formData.get("status") as string,
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

      toast.success("Projeto atualizado");
      setOpen(false);
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      toast.success("Produto excluido.");
      await deleteProject(project.id, project.name);
    });
  }

  async function handleFetchTeams() {
    setLoadingTeams(true);
    const result = await getLinearTeams();
    if (result.error) {
      toast.error(result.error);
    } else {
      setLinearTeams(result.teams);
      setShowTeamSelect(true);
    }
    setLoadingTeams(false);
  }

  function handleConnectTeam() {
    const team = linearTeams.find((t) => t.id === selectedTeamId);
    if (!team) return;

    startLinearTransition(async () => {
      const result = await connectLinearTeam(
        project.id,
        team.id,
        team.name
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        setLinearConfig({
          team_id: team.id,
          team_name: team.name,
          sync_enabled: true,
        });
        setShowTeamSelect(false);
        setSelectedTeamId("");
        toast.success("Linear conectado");
      }
    });
  }

  function handleToggleSync() {
    if (!linearConfig) return;
    const newValue = !linearConfig.sync_enabled;

    startLinearTransition(async () => {
      const result = await updateLinearSyncEnabled(project.id, newValue);
      if (result.error) {
        toast.error(result.error);
      } else {
        setLinearConfig({ ...linearConfig, sync_enabled: newValue });
      }
    });
  }

  function handleDisconnect() {
    startLinearTransition(async () => {
      const result = await disconnectLinear(project.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setLinearConfig(null);
        setShowDisconnectConfirm(false);
        toast.success("Linear desconectado");
      }
    });
  }

  function handleClose() {
    setOpen(false);
    setShowDeleteConfirm(false);
    setDeleteConfirmName("");
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {children}
      </span>

      <ValkDialog
        open={open}
        onClose={handleClose}
        title="Editar projeto"
        subtitle="Atualize as informacoes do projeto"
        size="lg"
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
              type="submit"
              form="edit-project-form"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>
          </>
        }
      >
        <form id="edit-project-form" onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          {/* Status */}
          <div>
            <label htmlFor="status" className="label">
              Status
            </label>
            <ValkSelect
              name="status"
              value={status}
              onValueChange={setStatus}
              options={statuses}
              disabled={isPending}
            />
          </div>

          {/* Logo + Nome */}
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
            <LogoUpload
              value={logoUrl || null}
              onChange={setLogoUrl}
              projectId={project.id}
            />
            <div className="flex-1">
              <label htmlFor="name" className="label">
                Nome
              </label>
              <ValkInput
                id="name"
                name="name"
                required
                defaultValue={project.name}
                disabled={isPending}
              />
            </div>
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
              defaultValue={project.description ?? ""}
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
                options={[{ value: "", label: "\u2014" }, ...thesisTypes]}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Hipotese central */}
          <div>
            <label htmlFor="thesis_hypothesis" className="label">
              Hipotese central
            </label>
            <ValkTextarea
              id="thesis_hypothesis"
              name="thesis_hypothesis"
              rows={2}
              defaultValue={project.thesis_hypothesis ?? ""}
              placeholder="O que voce quer provar com esse produto?"
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
              defaultValue={project.launch_target ?? ""}
              disabled={isPending}
            />
          </div>

          {/* Linear — admin only */}
          <RoleGate allowed={["admin"]}>
            <div>
              <div className="mt-2 h-px bg-[#141414]" />
              <h3 className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-[#444]">
                Linear
              </h3>

              {!linearConfig ? (
                <div className="mt-3">
                  <p className="text-[12px] leading-relaxed text-[#555]">
                    Conecte este produto a um team do Linear pra sincronizar
                    tasks de dev.
                  </p>

                  {!showTeamSelect ? (
                    <button
                      type="button"
                      onClick={handleFetchTeams}
                      disabled={loadingTeams}
                      className="mt-3 flex items-center gap-2 rounded-lg border border-[#222] bg-transparent px-3.5 py-[7px] text-[12px] font-medium text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc] disabled:opacity-50"
                    >
                      {loadingTeams && (
                        <Loader2 size={12} className="animate-spin" />
                      )}
                      Conectar Linear
                    </button>
                  ) : (
                    <div className="mt-3 flex flex-col gap-2.5">
                      <ValkSelect
                        value={selectedTeamId}
                        onValueChange={setSelectedTeamId}
                        options={[
                          { value: "", label: "Selecione um team..." },
                          ...linearTeams.map((t) => ({
                            value: t.id,
                            label: `${t.name} (${t.key})`,
                          })),
                        ]}
                        placeholder="Selecione um team..."
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowTeamSelect(false);
                            setSelectedTeamId("");
                          }}
                          className="rounded-lg px-3 py-1.5 text-[11px] text-[#555] transition-colors hover:text-[#888]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleConnectTeam}
                          disabled={!selectedTeamId || linearPending}
                          className="flex items-center gap-1.5 rounded-lg bg-[#E24B4A] px-3.5 py-1.5 text-[11px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] disabled:opacity-50"
                        >
                          {linearPending && (
                            <Loader2 size={11} className="animate-spin" />
                          )}
                          Conectar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-3 flex flex-col gap-3">
                  {/* Connected indicator */}
                  <div className="flex items-center gap-2">
                    <div className="h-[6px] w-[6px] rounded-full bg-[#10B981]" />
                    <span className="text-[12px] text-[#10B981]">
                      Conectado ao team {linearConfig.team_name}
                    </span>
                  </div>

                  {/* Sync toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#888]">
                      Sincronizacao ativa
                    </span>
                    <ValkToggle
                      checked={linearConfig.sync_enabled}
                      onCheckedChange={handleToggleSync}
                      disabled={linearPending}
                    />
                  </div>

                  {/* Disconnect */}
                  {!showDisconnectConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDisconnectConfirm(true)}
                      className="self-start rounded-lg border border-[rgba(226,75,74,0.15)] bg-transparent px-3 py-[5px] text-[11px] text-[#E24B4A]/70 transition-all duration-150 hover:border-[rgba(226,75,74,0.3)] hover:bg-[rgba(226,75,74,0.06)] hover:text-[#E24B4A]"
                    >
                      Desconectar
                    </button>
                  ) : (
                    <div className="rounded-lg border border-[#1A1A1A] bg-[#050505] p-3">
                      <p className="text-[11px] text-[#888]">
                        Desconectar o Linear? Tasks existentes manterao o
                        link, mas novas nao sincronizarao.
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDisconnectConfirm(false)}
                          className="rounded-md px-2.5 py-1 text-[11px] text-[#555] transition-colors hover:text-[#888]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleDisconnect}
                          disabled={linearPending}
                          className="flex items-center gap-1.5 rounded-md bg-[#E24B4A] px-3 py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#D4403F] disabled:opacity-50"
                        >
                          {linearPending && (
                            <Loader2 size={10} className="animate-spin" />
                          )}
                          Desconectar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </RoleGate>

          {/* Stripe — admin only */}
          <RoleGate allowed={["admin"]}>
            <StripeSection project={project} configured={stripeConfigured} />
          </RoleGate>

          {/* Danger zone — admin only */}
          <RoleGate allowed={["admin"]}>
            {!showDeleteConfirm ? (
              <div>
                <div className="mt-6 h-px bg-[#141414]" />
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[12px] text-[#555]">
                    Excluir este produto permanentemente
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-lg border border-[rgba(226,75,74,0.2)] bg-transparent px-3.5 py-[7px] text-[12px] text-[#E24B4A] transition-all duration-200 hover:border-[rgba(226,75,74,0.4)] hover:bg-[rgba(226,75,74,0.08)]"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mt-6 h-px bg-[#141414]" />
                <h3 className="mt-4 font-display text-[16px] font-semibold text-[#eee]">
                  Tem certeza?
                </h3>
                <p className="mt-2 text-[13px] text-[#888]">
                  O produto <span className="text-[#ccc]">{project.name}</span> sera
                  excluido permanentemente junto com todos os dados associados.
                </p>
                <div className="mt-3">
                  <label className="label">
                    Digite o nome do produto para confirmar
                  </label>
                  <ValkInput
                    type="text"
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    placeholder={project.name}
                  />
                </div>
                <div className="mt-4 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmName("");
                    }}
                    className="rounded-lg px-4 py-2.5 text-[12px] text-[#555] transition-colors hover:text-[#888]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteConfirmName !== project.name || isDeleting}
                    className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] disabled:opacity-40"
                  >
                    {isDeleting && <Loader2 size={14} className="animate-spin" />}
                    Excluir permanentemente
                  </button>
                </div>
              </div>
            )}
          </RoleGate>
        </form>
      </ValkDialog>
    </>
  );
}
