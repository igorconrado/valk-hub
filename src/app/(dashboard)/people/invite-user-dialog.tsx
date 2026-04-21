"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ValkDialog,
  ValkInput,
  ValkSelect,
  type ValkSelectOption,
} from "@/components/ds";
import { inviteUser } from "./actions";

const roleOptions: ValkSelectOption[] = [
  { value: "operator", label: "Operador" },
  { value: "stakeholder", label: "Investidor" },
];

export function InviteUserDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState("operator");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await inviteUser({
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        role: fd.get("role") as string,
        company_role: (fd.get("company_role") as string) || null,
        dedication: null,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        `${result.name} convidado. O acesso é ativado no primeiro login via magic link.`
      );
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {children}
      </button>

      <ValkDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("dialogs.inviteUser")}
        subtitle="Adicione um novo membro à VALK"
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
                const form = document.getElementById("invite-user-form") as HTMLFormElement | null;
                form?.requestSubmit();
              }}
              className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Convidar
            </button>
          </>
        }
      >
        <form id="invite-user-form" onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          {/* Nome */}
          <div>
            <label htmlFor="inv-name" className="label">
              Nome completo
            </label>
            <ValkInput
              id="inv-name"
              name="name"
              required
              placeholder="Nome Sobrenome"
              disabled={isPending}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="inv-email" className="label">
              Email
            </label>
            <ValkInput
              id="inv-email"
              name="email"
              type="email"
              required
              placeholder="nome@valkbr.com"
              disabled={isPending}
            />
          </div>

          {/* Role */}
          <div>
            <label className="label">Role</label>
            <ValkSelect
              value={role}
              onValueChange={setRole}
              options={roleOptions}
              name="role"
              disabled={isPending}
            />
          </div>

          {/* Company role */}
          <div>
            <label htmlFor="inv-crole" className="label">
              Cargo
            </label>
            <ValkInput
              id="inv-crole"
              name="company_role"
              placeholder="Ex: Desenvolvedor, Designer"
              disabled={isPending}
            />
          </div>

        </form>
      </ValkDialog>
    </>
  );
}
