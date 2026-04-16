"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
      <DialogContent className="border-[#1A1A1A] bg-[#111] sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="font-display text-[16px] font-semibold text-white">
            Motivo do bloqueio
          </DialogTitle>
          <DialogDescription className="text-[12px] text-[#555]">
            Explique por que essa task esta sendo bloqueada.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#444]">
              Motivo *
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
              Quem pode desbloquear? (opcional)
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

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-[#222] bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc]"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!reason.trim() || isPending}
              className="rounded-lg bg-[#E24B4A] px-4 py-1.5 text-[12px] font-medium text-white transition-colors duration-150 hover:bg-[#D4403F] disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Bloquear task"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
