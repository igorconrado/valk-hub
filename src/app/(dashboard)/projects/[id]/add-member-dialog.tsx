"use client";

import { useState, useTransition, useMemo } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addMember } from "../actions";

type AvailableUser = {
  id: string;
  name: string;
  company_role: string | null;
};

const inputClass =
  "w-full rounded-lg border border-[#1A1A1A] bg-[#050505] px-3.5 py-2.5 text-[13px] text-[#ddd] placeholder-[#333] transition-all duration-200 focus:border-[#E24B4A] focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.06)]";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#444]";

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[8px] font-semibold text-[#555]">
      {initials}
    </div>
  );
}

export function AddMemberDialog({
  projectId,
  availableUsers,
  children,
}: {
  projectId: string;
  availableUsers: AvailableUser[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [role, setRole] = useState("member");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      availableUsers.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
      ),
    [availableUsers, search]
  );

  const selectedUser = availableUsers.find((u) => u.id === selectedUserId);

  function handleSubmit() {
    if (!selectedUserId) return;

    startTransition(async () => {
      const result = await addMember(projectId, selectedUserId, role);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`${result.memberName} adicionado ao projeto`);
      setOpen(false);
      setSearch("");
      setSelectedUserId(null);
      setRole("member");
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setSearch("");
          setSelectedUserId(null);
          setRole("member");
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-[460px] gap-0 rounded-[14px] border border-[#1A1A1A] bg-[#0A0A0A] p-0"
      >
        <div className="shrink-0 px-7 pt-7">
          <DialogHeader className="gap-1">
            <DialogTitle className="font-display text-[17px] font-semibold text-[#eee]">
              Adicionar membro
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[#555]">
              Selecione um usuário para adicionar ao projeto
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-4.5 overflow-y-auto px-7 py-5">
          {/* Search */}
          <div>
            <label className={labelClass}>Membro</label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#333]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedUserId(null);
                }}
                placeholder="Buscar por nome..."
                className={`${inputClass} pl-9`}
              />
            </div>

            {/* User list */}
            {!selectedUser && (
              <div className="mt-1.5 max-h-[160px] overflow-y-auto rounded-lg border border-[#1A1A1A] bg-[#050505]">
                {filtered.length === 0 ? (
                  <p className="px-3.5 py-3 text-[12px] text-[#444]">
                    Nenhum usuário disponível
                  </p>
                ) : (
                  filtered.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setSearch(user.name);
                      }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
                    >
                      <UserAvatar name={user.name} />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] text-[#ccc]">
                          {user.name}
                        </p>
                        {user.company_role && (
                          <p className="truncate text-[11px] text-[#555]">
                            {user.company_role}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected user pill */}
            {selectedUser && (
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#1A1A1A] bg-[#050505] px-3 py-2">
                <UserAvatar name={selectedUser.name} />
                <span className="text-[13px] text-[#ccc]">
                  {selectedUser.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserId(null);
                    setSearch("");
                  }}
                  className="ml-auto text-[#444] hover:text-[#888]"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="member_role" className={labelClass}>
              Papel no projeto
            </label>
            <select
              id="member_role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`${inputClass} appearance-none`}
            >
              <option value="owner">Owner</option>
              <option value="member">Member</option>
            </select>
          </div>

          </div>

          {/* Sticky footer */}
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
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !selectedUserId}
                className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)] disabled:opacity-70"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
