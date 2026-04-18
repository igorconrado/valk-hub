"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ValkDialog,
  ValkDialogContent,
  ValkDialogHeader,
  ValkDialogTitle,
  ValkDialogTrigger,
} from "@/components/ds";
import { removeMember } from "../actions";

export function RemoveMemberDialog({
  projectId,
  projectName,
  userId,
  memberName,
  children,
}: {
  projectId: string;
  projectName: string;
  userId: string;
  memberName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      const result = await removeMember(projectId, userId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`${memberName} removido do projeto`);
      setOpen(false);
    });
  }

  return (
    <ValkDialog open={open} onOpenChange={setOpen}>
      <ValkDialogTrigger asChild>{children}</ValkDialogTrigger>
      <ValkDialogContent className="max-w-[360px] p-7">
        <ValkDialogHeader>
          <ValkDialogTitle className="text-[14px]">
            Remover {memberName} do projeto {projectName}?
          </ValkDialogTitle>
        </ValkDialogHeader>

        <p className="mt-1 text-[12px] text-[#555]">
          Esta ação pode ser revertida adicionando o membro novamente.
        </p>

        <div className="mt-6 flex justify-end gap-2.5">
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
            onClick={handleRemove}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Remover
          </button>
        </div>
      </ValkDialogContent>
    </ValkDialog>
  );
}
