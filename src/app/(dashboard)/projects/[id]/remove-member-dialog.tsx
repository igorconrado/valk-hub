"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-[360px] rounded-[14px] border border-[#1A1A1A] bg-[#0A0A0A] p-7"
      >
        <DialogHeader className="gap-1">
          <DialogTitle className="text-[14px] font-medium text-[#eee]">
            Remover {memberName} do projeto {projectName}?
          </DialogTitle>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
