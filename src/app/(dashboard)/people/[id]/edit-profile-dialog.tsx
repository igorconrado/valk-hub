"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "../actions";

type Person = {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  responsibilities: string | null;
  role: string;
  company_role: string | null;
  dedication: string | null;
};

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];
const MAX_SIZE = 2 * 1024 * 1024;

const inputClass =
  "w-full rounded-lg border border-[#1A1A1A] bg-[#050505] px-3.5 py-2.5 text-[13px] text-[#ddd] placeholder-[#333] transition-all duration-200 focus:border-[#E24B4A] focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.06)]";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#444]";

function AvatarUpload({
  value,
  onChange,
  userId,
}: {
  value: string | null;
  onChange: (url: string) => void;
  userId: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) return;
      if (file.size > MAX_SIZE) return;

      setIsUploading(true);
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const filename = `avatar-${userId}-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("project-logos")
        .upload(filename, file, { upsert: true });

      if (!error) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("project-logos").getPublicUrl(filename);
        onChange(publicUrl);
      }

      setIsUploading(false);
    },
    [userId, onChange]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  const initials = "?";

  return (
    <div className="flex flex-col items-center">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-[#0A0A0A] transition-colors ${
          isDragging
            ? "border-[#E24B4A] border-solid"
            : "border-[#2A2A2A] border-dashed hover:border-[#3A3A3A]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.svg"
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
            <Loader2 size={20} className="animate-spin text-white" />
          </div>
        )}

        {value ? (
          <>
            <img
              src={value}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white">
                Trocar
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <ImageIcon size={20} strokeWidth={1.2} className="text-[#444]" />
            <span className="text-[9px] font-medium uppercase tracking-wider text-[#555]">
              Foto
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function EditProfileDialog({
  person,
  isAdmin,
  children,
}: {
  person: Person;
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState(person.avatar_url ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfile({
        user_id: person.id,
        name: fd.get("name") as string,
        avatar_url: avatarUrl || null,
        bio: (fd.get("bio") as string) || null,
        responsibilities: (fd.get("responsibilities") as string) || null,
        ...(isAdmin
          ? {
              role: fd.get("role") as string,
              company_role: (fd.get("company_role") as string) || null,
              dedication: (fd.get("dedication") as string) || null,
            }
          : {}),
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Perfil atualizado");
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
              Editar perfil
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[#555]">
              Atualize as informações do perfil
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex max-h-[60vh] flex-col gap-4.5 overflow-y-auto px-7 py-5">
            {/* Avatar */}
            <AvatarUpload
              value={avatarUrl || null}
              onChange={setAvatarUrl}
              userId={person.id}
            />

            {/* Nome */}
            <div>
              <label htmlFor="prof-name" className={labelClass}>
                Nome
              </label>
              <input
                id="prof-name"
                name="name"
                required
                defaultValue={person.name}
                disabled={isPending}
                className={inputClass}
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="prof-bio" className={labelClass}>
                Bio
              </label>
              <textarea
                id="prof-bio"
                name="bio"
                rows={3}
                defaultValue={person.bio ?? ""}
                placeholder="Conte um pouco sobre você..."
                disabled={isPending}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Responsabilidades */}
            <div>
              <label htmlFor="prof-resp" className={labelClass}>
                Responsabilidades
              </label>
              <textarea
                id="prof-resp"
                name="responsibilities"
                rows={2}
                defaultValue={person.responsibilities ?? ""}
                placeholder="O que você faz na VALK..."
                disabled={isPending}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Admin-only fields */}
            {isAdmin && (
              <>
                <div className="h-px bg-[#141414]" />
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#444]">
                  Administração
                </h3>

                {/* Role */}
                <div>
                  <label htmlFor="prof-role" className={labelClass}>
                    Role
                  </label>
                  <select
                    id="prof-role"
                    name="role"
                    defaultValue={person.role}
                    disabled={isPending}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="admin">Admin</option>
                    <option value="operator">Operator</option>
                    <option value="stakeholder">Stakeholder</option>
                  </select>
                </div>

                {/* Company role */}
                <div>
                  <label htmlFor="prof-crole" className={labelClass}>
                    Cargo
                  </label>
                  <input
                    id="prof-crole"
                    name="company_role"
                    defaultValue={person.company_role ?? ""}
                    placeholder="Ex: CTO, Product Manager..."
                    disabled={isPending}
                    className={inputClass}
                  />
                </div>

                {/* Dedication */}
                <div>
                  <label htmlFor="prof-ded" className={labelClass}>
                    Dedicação
                  </label>
                  <select
                    id="prof-ded"
                    name="dedication"
                    defaultValue={person.dedication ?? ""}
                    disabled={isPending}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">—</option>
                    <option value="full_time">Full-time</option>
                    <option value="partial">Parcial</option>
                  </select>
                </div>
              </>
            )}
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
                Salvar
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
