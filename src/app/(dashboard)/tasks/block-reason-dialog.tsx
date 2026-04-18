"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  ValkDialog,
  ValkDialogContent,
  ValkDialogDescription,
  ValkDialogHeader,
  ValkDialogTitle,
  ValkTextarea,
  ValkSelect,
} from "@/components/ds";
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
    <ValkDialog open={open} onOpenChange={handleOpenChange}>
      <ValkDialogContent className="max-w-[420px]">
        <div className="px-7 pt-7">
          <ValkDialogHeader>
            <ValkDialogTitle>O que esta travando?</ValkDialogTitle>
            <ValkDialogDescription>
              Descreva o motivo do bloqueio desta task.
            </ValkDialogDescription>
          </ValkDialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        <div className="flex flex-col gap-4.5 px-7 py-5">
          <div>
            <label className="label">Motivo do bloqueio *</label>
            <ValkTextarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo do bloqueio..."
              rows={3}
            />
          </div>

          <div>
            <label className="label">Quem pode destravar? (opcional)</label>
            <ValkSelect
              value={blockedBy}
              onValueChange={setBlockedBy}
              placeholder="Ninguem especifico"
              options={[
                { value: "", label: "Ninguem especifico" },
                ...users.map((u) => ({
                  value: u.id,
                  label: u.name,
                })),
              ]}
            />
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
      </ValkDialogContent>
    </ValkDialog>
  );
}
