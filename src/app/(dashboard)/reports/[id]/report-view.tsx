"use client";

import {
  useState,
  useRef,
  useCallback,
  useTransition,
  useEffect,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Check,
  Download,
  Loader2,
  MoreHorizontal,
  Trash2,
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
import { saveReport, publishReport, deleteReport } from "../actions";

type Report = {
  id: string;
  title: string;
  content: string | null;
  type: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  ai_generated: boolean | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  project: { id: string; name: string } | { id: string; name: string }[] | null;
  author: { id: string; name: string } | { id: string; name: string }[] | null;
};

const typeConfig: Record<string, { label: string; color: string }> = {
  sprint: { label: "Sprint", color: "#3B82F6" },
  monthly: { label: "Mensal", color: "#E24B4A" },
  experiment: { label: "Experimento", color: "#8B5CF6" },
  quarterly: { label: "Trimestral", color: "#F59E0B" },
  custom: { label: "Personalizado", color: "#888" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "#F59E0B" },
  published: { label: "Publicado", color: "#10B981" },
};

function resolve<T>(val: T | T[] | null): T | null {
  if (val == null) return null;
  if (Array.isArray(val)) return val[0] ?? null;
  return val;
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: `${color}15`,
        color,
        border: `1px solid ${color}25`,
      }}
    >
      {label}
    </span>
  );
}

export function ReportView({
  report,
  projects,
}: {
  report: Report;
  projects: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState(report.title);
  const [content, setContent] = useState(report.content ?? "");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">(
    "idle"
  );
  const [isPublishing, startPublishTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const { isAdmin, isOperator } = useRole();
  const canEdit = isAdmin || isOperator;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const project = resolve(report.project);
  const author = resolve(report.author);
  const typeCfg = typeConfig[report.type] ?? typeConfig.custom;
  const statusCfg = statusConfig[report.status] ?? statusConfig.draft;

  const timeAgo = formatDistanceToNow(new Date(report.updated_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const periodStr =
    report.period_start && report.period_end
      ? `${format(new Date(report.period_start), "dd MMM", { locale: ptBR })} — ${format(new Date(report.period_end), "dd MMM yyyy", { locale: ptBR })}`
      : null;

  const doSave = useCallback(
    async (updates: { title?: string; content?: string }) => {
      setSaveStatus("saving");
      const result = await saveReport(report.id, updates);
      if (result.error) {
        toast.error(result.error);
        setSaveStatus("idle");
      } else {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    },
    [report.id]
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

  function handlePublish() {
    startPublishTransition(async () => {
      const result = await publishReport(report.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Relatório publicado");
    });
  }

  function handleDelete() {
    if (!confirm("Excluir este relatório permanentemente?")) return;
    startDeleteTransition(async () => {
      toast.success("Relatório excluído.");
      await deleteReport(report.id);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Print header */}
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
          {project?.name ?? "Empresa"}
        </span>
      </div>

      {/* Breadcrumb */}
      <nav
        data-print-hide
        className="mb-4 flex items-center gap-1.5 text-[12px]"
      >
        <Link
          href="/reports"
          className="font-medium text-[#444] transition-colors hover:text-[#888]"
        >
          Relatórios
        </Link>
        <span className="text-[#333]">/</span>
        <span className="max-w-[240px] truncate font-medium text-[#ccc]">
          {title || "Sem título"}
        </span>
      </nav>

      {/* Metadata bar */}
      <div
        data-print-hide
        className="flex flex-wrap items-center gap-2"
      >
        <Badge label={typeCfg.label} color={typeCfg.color} />
        {project && (
          <span className="inline-flex rounded-full border border-[#1A1A1A] bg-[#0F0F0F] px-2 py-0.5 text-[10px] font-medium text-[#555]">
            {project.name}
          </span>
        )}
        {periodStr && (
          <span className="text-[11px] text-[#555]">{periodStr}</span>
        )}
        <Badge label={statusCfg.label} color={statusCfg.color} />
        {report.ai_generated && (
          <span className="flex items-center gap-1 text-[11px] text-[#E24B4A]">
            ✦ Gerado por AI
          </span>
        )}
        <span className="flex items-center gap-1 text-[11px] text-[#333]">
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
          {report.status === "draft" && canEdit && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-1.5 rounded-lg bg-[#10B981] px-3 py-1 text-[11px] font-semibold text-white transition-all duration-150 hover:bg-[#0D9668] disabled:opacity-70"
            >
              {isPublishing && (
                <Loader2 size={12} className="animate-spin" />
              )}
              Publicar
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-[#1F1F1F] bg-transparent px-2.5 py-1 text-[11px] text-[#555] transition-all duration-150 hover:border-[#2A2A2A] hover:bg-white/[0.02] hover:text-[#888]"
          >
            <Download size={12} strokeWidth={1.5} />
            Exportar PDF
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
        <input
          data-print-title
          value={title}
          onChange={handleTitleChange}
          readOnly={!canEdit}
          placeholder="Sem título"
          className="w-full border-none bg-transparent font-display text-[24px] font-semibold text-[#eee] placeholder-[#222] outline-none"
        />

        <div className="mt-4">
          <DocumentEditor
            content={content}
            onChange={handleContentChange}
            editable={canEdit}
            placeholder="Conteúdo do relatório..."
          />
        </div>
      </div>

      {/* Print footer */}
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
          · {report.ai_generated ? "AI ✦" : "Manual"} · Confidencial
        </span>
        <span style={{ fontSize: 9, color: "#999" }}>VALK SOFTWARE</span>
      </div>
    </motion.div>
  );
}
