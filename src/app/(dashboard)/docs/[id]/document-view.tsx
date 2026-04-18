"use client";

import { useState, useRef, useCallback, useTransition, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Check,
  Clock,
  Download,
  MoreHorizontal,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRole } from "@/lib/hooks/use-role";
import { RoleGate } from "@/components/role-gate";
import { DocumentEditor } from "@/components/editor/document-editor";
import { saveDocument, deleteDocument } from "../actions";
import { VersionHistoryPanel } from "./version-history-panel";

type Doc = {
  id: string;
  title: string;
  content: string | null;
  type: string;
  project_id: string | null;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  author: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
};

const TYPE_OPTIONS = [
  { value: "contexto", label: "Contexto" },
  { value: "prd", label: "PRD" },
  { value: "spec", label: "Spec" },
  { value: "aprendizado", label: "Aprendizado" },
  { value: "ata", label: "Ata" },
  { value: "template", label: "Template" },
  { value: "relatorio", label: "Relatorio" },
  { value: "livre", label: "Livre" },
];

const TYPE_COLORS: Record<string, string> = {
  contexto: "#5B9BF0",
  prd: "#A07EF0",
  spec: "#3DC9A0",
  aprendizado: "#E8A840",
  ata: "#888",
  template: "#666",
  relatorio: "#E86B6A",
  livre: "#555",
};

function MetadataDropdown({
  value,
  options,
  onChange,
  canEdit,
  colorMap,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  canEdit: boolean;
  colorMap?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  const color = colorMap?.[value] ?? "#888";

  return (
    <div className="relative">
      <button
        onClick={() => canEdit && setOpen(!open)}
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
          canEdit ? "cursor-pointer hover:brightness-125" : "cursor-default"
        }`}
        style={{
          backgroundColor: `${color}15`,
          color,
          border: `1px solid ${color}25`,
        }}
      >
        {current?.label ?? value}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-[61] mt-1 min-w-[120px] rounded-lg border border-[#1A1A1A] bg-[#111] p-1 shadow-xl">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition-colors hover:bg-white/[0.04] ${
                  opt.value === value ? "text-white" : "text-[#888]"
                }`}
              >
                {colorMap && (
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: colorMap[opt.value] ?? "#888" }}
                  />
                )}
                {opt.label}
                {opt.value === value && (
                  <Check size={10} className="ml-auto text-[#E24B4A]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function DocumentView({
  doc,
  projects,
}: {
  doc: Doc;
  projects: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content ?? "");
  const [type, setType] = useState(doc.type);
  const [projectId, setProjectId] = useState(doc.project_id);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">(
    "idle"
  );
  const [versionPanelOpen, setVersionPanelOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const { isAdmin, isOperator, isStakeholder } = useRole();
  const canEdit = isAdmin || isOperator;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const projectOptions = [
    { value: "", label: "Empresa" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  const timeAgo = formatDistanceToNow(new Date(doc.updated_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const doSave = useCallback(
    async (updates: {
      title?: string;
      content?: string;
      type?: string;
      project_id?: string | null;
    }) => {
      setSaveStatus("saving");
      const result = await saveDocument(doc.id, updates);
      if (result.error) {
        toast.error(result.error);
        setSaveStatus("idle");
      } else {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    },
    [doc.id]
  );

  const debouncedSave = useCallback(
    (updates: { title?: string; content?: string }) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        doSave(updates);
      }, 2000);
    },
    [doSave]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (canEdit) debouncedSave({ title: newTitle });
  }

  function handleContentChange(newContent: string) {
    setContent(newContent);
    if (canEdit) debouncedSave({ content: newContent });
  }

  function handleTypeChange(newType: string) {
    setType(newType);
    doSave({ type: newType });
  }

  function handleProjectChange(newProjectId: string) {
    const val = newProjectId || null;
    setProjectId(val);
    doSave({ project_id: val });
  }

  function handleDelete() {
    if (!confirm("Excluir este documento permanentemente?")) return;
    startDeleteTransition(async () => {
      toast.success("Documento excluido.");
      await deleteDocument(doc.id);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Print header — hidden on screen, visible in print */}
      <div
        data-print-header
        className="mb-6 hidden items-center justify-between"
      >
        <div className="flex items-center gap-1.5">
          <span
            style={{
              fontFamily: "'Clash Display', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: "#111",
            }}
          >
            VALK
          </span>
          <span
            style={{
              display: "inline-block",
              width: 4,
              height: 4,
              borderRadius: "50%",
              backgroundColor: "#E24B4A",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#888",
              marginLeft: 4,
            }}
          >
            SOFTWARE
          </span>
        </div>
        <span style={{ fontSize: 10, color: "#888" }}>
          {doc.project?.name ?? "Empresa"}
        </span>
      </div>

      {/* Breadcrumb */}
      <nav data-print-hide className="mb-4 flex items-center gap-1.5 text-[12px]">
        <Link
          href="/docs"
          className="font-medium text-[#444] transition-colors hover:text-[#888]"
        >
          Docs
        </Link>
        <span className="text-[#333]">/</span>
        <span className="max-w-[200px] truncate font-medium text-[#ccc]">
          {title || "Sem titulo"}
        </span>
      </nav>

      {/* Metadata bar */}
      <div data-print-hide className="flex flex-wrap items-center gap-2">
        <MetadataDropdown
          value={type}
          options={TYPE_OPTIONS}
          onChange={handleTypeChange}
          canEdit={canEdit}
          colorMap={TYPE_COLORS}
        />
        <MetadataDropdown
          value={projectId ?? ""}
          options={projectOptions}
          onChange={handleProjectChange}
          canEdit={canEdit}
        />
        <span className="text-[12px] text-[#555]">
          por {doc.author?.name ?? "Desconhecido"}
        </span>
        <span className="font-mono text-[11px] text-[#444]">
          v{doc.version}
        </span>
        <span suppressHydrationWarning className="flex items-center gap-1 text-[11px] text-[#333]">
          {saveStatus === "saving" ? (
            <>
              <Loader2 size={10} className="animate-spin text-[#555]" />
              Salvando...
            </>
          ) : saveStatus === "saved" ? (
            <>
              <Check size={10} className="text-[#10B981]" />
              Salvo
            </>
          ) : (
            `Salvo ${timeAgo}`
          )}
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-[#1F1F1F] bg-transparent px-2.5 py-1 text-[11px] text-[#555] transition-all duration-150 hover:border-[#2A2A2A] hover:bg-white/[0.02] hover:text-[#888]"
          >
            <Download size={12} strokeWidth={1.5} />
            Exportar PDF
          </button>
          <button
            onClick={() => setVersionPanelOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#1F1F1F] bg-transparent px-2.5 py-1 text-[11px] text-[#555] transition-all duration-150 hover:border-[#2A2A2A] hover:bg-white/[0.02] hover:text-[#888]"
          >
            <Clock size={12} strokeWidth={1.5} />
            Historico
          </button>
          <RoleGate allowed={["admin"]}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#1F1F1F] text-[#555] transition-colors hover:border-[#2A2A2A] hover:bg-white/[0.02] hover:text-[#888]">
                  <MoreHorizontal size={14} strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-[#E24B4A] focus:text-[#E24B4A]"
                >
                  <Trash2 size={13} className="mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </RoleGate>
        </div>
      </div>

      {/* Editor area */}
      <div data-print-content className="mx-auto mt-8 max-w-[720px]">
        {/* Title */}
        <input
          data-print-title
          value={title}
          onChange={handleTitleChange}
          readOnly={!canEdit}
          placeholder="Sem titulo"
          className="w-full border-none bg-transparent font-display text-[28px] font-semibold text-[#eee] placeholder-[#222] outline-none"
        />

        {/* Body */}
        <div className="mt-4">
          <DocumentEditor
            content={content}
            onChange={handleContentChange}
            editable={canEdit}
            placeholder="Comece a escrever..."
          />
        </div>
      </div>

      {/* Print footer — hidden on screen, visible in print */}
      <div
        data-print-footer
        className="mt-12 hidden items-center justify-between border-t border-[#ddd] pt-3"
      >
        <span suppressHydrationWarning style={{ fontSize: 9, color: "#999" }}>
          Gerado em{" "}
          {new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}{" "}
          · Versao {doc.version} · Confidencial
        </span>
        <span
          style={{
            fontSize: 9,
            color: "#999",
          }}
        >
          VALK SOFTWARE
        </span>
      </div>

      {/* Version history panel */}
      <VersionHistoryPanel
        docId={doc.id}
        open={versionPanelOpen}
        onClose={() => setVersionPanelOpen(false)}
      />
    </motion.div>
  );
}
