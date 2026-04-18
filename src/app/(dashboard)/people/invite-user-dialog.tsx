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
import { inviteUser } from "./actions";

const inputClass =
  "w-full rounded-lg border border-[#1A1A1A] bg-[#050505] px-3.5 py-2.5 text-[13px] text-[#ddd] placeholder-[#333] transition-all duration-200 focus:border-[#E24B4A] focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.06)]";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#444]";

export function InviteUserDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-[460px] gap-0 rounded-[14px] border border-[#1A1A1A] bg-[#0A0A0A] p-0"
      >
        <div className="shrink-0 px-7 pt-7">
          <DialogHeader className="gap-1">
            <DialogTitle className="font-display text-[17px] font-semibold text-[#eee]">
              Convidar ao time
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[#555]">
              Adicione um novo membro à VALK
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex max-h-[60vh] flex-col gap-4.5 overflow-y-auto px-7 py-5">
            {/* Nome */}
            <div>
              <label htmlFor="inv-name" className={labelClass}>
                Nome completo
              </label>
              <input
                id="inv-name"
                name="name"
                required
                placeholder="Nome Sobrenome"
                disabled={isPending}
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="inv-email" className={labelClass}>
                Email
              </label>
              <input
                id="inv-email"
                name="email"
                type="email"
                required
                placeholder="nome@valkbr.com"
                disabled={isPending}
                className={inputClass}
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="inv-role" className={labelClass}>
                Role
              </label>
              <select
                id="inv-role"
                name="role"
                defaultValue="operator"
                disabled={isPending}
                className={`${inputClass} appearance-none`}
              >
                <option value="operator">Operator</option>
                <option value="stakeholder">Stakeholder</option>
              </select>
            </div>

            {/* Company role */}
            <div>
              <label htmlFor="inv-crole" className={labelClass}>
                Cargo
              </label>
              <input
                id="inv-crole"
                name="company_role"
                placeholder="Ex: Desenvolvedor, Designer"
                disabled={isPending}
                className={inputClass}
              />
            </div>

            {/* Dedication */}
            <div>
              <label htmlFor="inv-ded" className={labelClass}>
                Dedicação
              </label>
              <select
                id="inv-ded"
                name="dedication"
                defaultValue="full_time"
                disabled={isPending}
                className={`${inputClass} appearance-none`}
              >
                <option value="full_time">Full-time</option>
                <option value="partial">Parcial</option>
              </select>
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
      </DialogContent>
    </Dialog>
  );
}
