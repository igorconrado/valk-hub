"use client";

import { useState, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  ValkDialog,
  ValkInput,
  ValkSelect,
  Avatar,
} from "@/components/ds";
import { addMember } from "../actions";

type AvailableUser = {
  id: string;
  name: string;
  company_role: string | null;
};

export function AddMemberDialog({
  projectId,
  availableUsers,
  children,
}: {
  projectId: string;
  availableUsers: AvailableUser[];
  children: React.ReactNode;
}) {
  const t = useTranslations();
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

  function handleClose() {
    setOpen(false);
    setSearch("");
    setSelectedUserId(null);
    setRole("member");
  }

  function handleSubmit() {
    if (!selectedUserId) return;

    startTransition(async () => {
      const result = await addMember(projectId, selectedUserId, role);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`${result.memberName} adicionado ao projeto`);
      handleClose();
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {children}
      </button>

      <ValkDialog
        open={open}
        onClose={handleClose}
        title={t("dialogs.addMember")}
        subtitle="Selecione um usuário para adicionar ao projeto"
        footer={
          <>
            <button
              type="button"
              onClick={handleClose}
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
          </>
        }
      >
        <div className="flex flex-col gap-4.5">
          {/* Search */}
          <div>
            <label className="label">Membro</label>
            <ValkInput
              prefixIcon={<Search size={14} />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedUserId(null);
              }}
              placeholder={t("search.searchByName")}
            />

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
                      <Avatar user={{ name: user.name, initials: user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(), color: "#555" }} size={22} />
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
                <Avatar user={{ name: selectedUser.name, initials: selectedUser.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(), color: "#555" }} size={22} />
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
            <label htmlFor="member_role" className="label">
              Papel no projeto
            </label>
            <ValkSelect
              value={role}
              onValueChange={setRole}
              options={[
                { value: "owner", label: "Owner" },
                { value: "member", label: "Member" },
              ]}
            />
          </div>
        </div>
      </ValkDialog>
    </>
  );
}
