"use client";

import { useState, useRef, useCallback } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

type LogoUploadProps = {
  value: string | null;
  onChange: (url: string) => void;
  projectId: string;
};

export function LogoUpload({ value, onChange, projectId }: LogoUploadProps) {
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
      const filename = `${projectId}-${Date.now()}.${ext}`;

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
    [projectId, onChange]
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

  return (
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
      className={`group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border bg-[#0A0A0A] transition-colors ${
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
          <img src={value} alt="Logo" className="h-full w-full object-cover" />
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white">
              Trocar
            </span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <ImageIcon size={24} strokeWidth={1.2} className="text-[#444]" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#555]">
            Logo
          </span>
        </div>
      )}
    </div>
  );
}
