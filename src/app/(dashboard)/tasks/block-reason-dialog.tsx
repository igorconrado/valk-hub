"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createTaskBlock } from "./actions";

export function BlockReasonDialog({
  open,
  taskId,
  users,
  onClose,
  onComplete,
}: {
  open: boolean;
  taskId: string;
  users: { id: string; name: string }[];
  onClose: () => void;
  onComplete: () => void;
}) {
  const [reason, setReason] = useState("");
  const [blockedBy, setBlockedBy] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!reason.trim()) return;

    startTransition(async () => {
      const result = await createTaskBlock(
        taskId,
        reason.trim(),
        blockedBy || null
      );

      if (!result.error) {
        setReason("");
        setBlockedBy("");
        onComplete();
      }
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setReason("");
      setBlockedBy("");
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[420px] gap-0 rounded-[14px] border border-[#1A1A1A] bg-[#0A0A0A] p-0"
      >
        <div className="px-7 pt-7">
          <DialogHeader className="gap-1">
            <DialogTitle className="font-display text-[17px] font-semibold text-[#eee]">
              O que esta travando?
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[#555]">
              Descreva o motivo do bloqueio desta task.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        <div className="flex flex-col gap-4.5 px-7 py-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#444]">
              Motivo do bloqueio *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo do bloqueio..."
              rows={3}
              className="w-full rounded-lg border border-[#1A1A1A] bg-[#050505] px-3.5 py-2.5 text-[13px] text-[#ddd] placeholder-[#333] transition-all duration-200 focus:border-[#E24B4A] focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.06)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#444]">
              Quem pode destravar? (opcional)
            </label>
            <select
              value={blockedBy}
              onChange={(e) => setBlockedBy(e.target.value)}
              className="w-full appearance-none rounded-lg border border-[#1A1A1A] bg-[#050505] px-3.5 py-2.5 text-[13px] text-[#ddd] transition-all duration-200 focus:border-[#E24B4A] focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.06)]"
            >
              <option value="">Ninguem especifico</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-[#141414] px-7 py-5">
          <div className="flex justify-end gap-2.5">
            <button
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-4 py-2.5 text-[12px] text-[#555] transition-colors hover:text-[#888]"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!reason.trim() || isPending}
              className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Bloquear task
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
