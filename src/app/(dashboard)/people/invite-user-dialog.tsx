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
} from "@/components/ds";
import { ValkInput } from "@/components/ds";
import { ValkSelect, type ValkSelectOption } from "@/components/ds";
import { inviteUser } from "./actions";

const roleOptions: ValkSelectOption[] = [
  { value: "operator", label: "Operator" },
  { value: "stakeholder", label: "Stakeholder" },
];

const dedicationOptions: ValkSelectOption[] = [
  { value: "full_time", label: "Full-time" },
  { value: "partial", label: "Parcial" },
];

export function InviteUserDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState("operator");
  const [dedication, setDedication] = useState("full_time");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await inviteUser({
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        role: fd.get("role") as string,
        company_role: (fd.get("company_role") as string) || null,
        dedication: (fd.get("dedication") as string) || null,
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
    <ValkDialog open={open} onOpenChange={setOpen}>
      <ValkDialogTrigger>{children}</ValkDialogTrigger>
      <ValkDialogContent className="max-w-[460px]">
        <div className="shrink-0 px-7 pt-7">
          <ValkDialogHeader>
            <ValkDialogTitle>Convidar ao time</ValkDialogTitle>
            <ValkDialogDescription>
              Adicione um novo membro à VALK
            </ValkDialogDescription>
          </ValkDialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex max-h-[60vh] flex-col gap-4.5 overflow-y-auto px-7 py-5">
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

            {/* Dedication */}
            <div>
              <label className="label">Dedicação</label>
              <ValkSelect
                value={dedication}
                onValueChange={setDedication}
                options={dedicationOptions}
                name="dedication"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Footer */}
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
                Convidar
              </button>
            </div>
          </div>
        </form>
      </ValkDialogContent>
    </ValkDialog>
  );
}
