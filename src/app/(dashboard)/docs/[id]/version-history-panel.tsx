"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useRole } from "@/lib/hooks/use-role";
import { DocumentEditor } from "@/components/editor/document-editor";
import { getDocumentVersions, restoreVersion } from "../actions";

type Version = {
  id: string;
  version: number;
  title: string;
  content: string | null;
  created_at: string;
  author: { name: string } | null;
};

export function VersionHistoryPanel({
  docId,
  open,
  onClose,
}: {
  docId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null);
  const [isPending, startTransition] = useTransition();
  const { isAdmin, isOperator } = useRole();
  const canRestore = isAdmin || isOperator;

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    const data = await getDocumentVersions(docId);
    // Normalize the author field (may be array from Supabase join)
    const normalized = data.map((v: any) => ({
      ...v,
      author: Array.isArray(v.author) ? v.author[0] : v.author,
    }));
    setVersions(normalized);
    setLoading(false);
  }, [docId]);

  useEffect(() => {
    if (open) {
      fetchVersions();
      setPreviewVersion(null);
    }
  }, [open, fetchVersions]);

  function handleRestore(versionId: string) {
    startTransition(async () => {
      const result = await restoreVersion(docId, versionId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Versao restaurada");
        onClose();
      }
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[#141414] bg-[#0A0A0A] sm:w-[520px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#141414] px-6 py-4">
              <h2 className="font-display text-[16px] font-semibold text-[#eee]">
                Historico de versoes
              </h2>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-[#444] transition-colors hover:bg-white/[0.04] hover:text-[#888]"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
              {previewVersion ? (
                /* Version preview */
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#141414] px-6 py-3">
                    <div>
                      <span className="font-mono text-[11px] text-[#888]">
                        v{previewVersion.version}
                      </span>
                      <span className="ml-2 text-[12px] text-[#555]">
                        {previewVersion.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {canRestore && (
                        <button
                          onClick={() => handleRestore(previewVersion.id)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 rounded-lg bg-[#E24B4A] px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#D4403F] disabled:opacity-50"
                        >
                          <RotateCcw size={11} strokeWidth={2} />
                          Restaurar
                        </button>
                      )}
                      <button
                        onClick={() => setPreviewVersion(null)}
                        className="rounded-lg px-3 py-1.5 text-[11px] text-[#555] transition-colors hover:text-[#888]"
                      >
                        Voltar
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    <DocumentEditor
                      content={previewVersion.content ?? ""}
                      onChange={() => {}}
                      editable={false}
                      placeholder=""
                    />
                  </div>
                </div>
              ) : (
                /* Version list */
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#333] border-t-[#E24B4A]" />
                    </div>
                  ) : versions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-[13px] text-[#444]">
                        Nenhuma versao anterior.
                      </p>
                      <p className="mt-1 text-[11px] text-[#333]">
                        Versoes sao salvas automaticamente.
                      </p>
                    </div>
                  ) : (
                    <div className="px-6 py-3">
                      {versions.map((version, i) => {
                        const timeAgo = formatDistanceToNow(
                          new Date(version.created_at),
                          { addSuffix: true, locale: ptBR }
                        );
                        const authorName =
                          version.author?.name ?? "Desconhecido";

                        return (
                          <div
                            key={version.id}
                            className="flex items-center justify-between border-b border-[#0F0F0F] py-3"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[12px] font-medium text-[#ccc]">
                                  v{version.version}
                                </span>
                                {i === 0 && (
                                  <span className="rounded-full bg-[#10B98115] px-1.5 py-px text-[9px] font-semibold text-[#10B981]">
                                    Atual
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-[11px] text-[#444]">
                                por {authorName} · {timeAgo}
                              </p>
                            </div>
                            <button
                              onClick={() => setPreviewVersion(version)}
                              className="shrink-0 rounded-md px-2.5 py-1 text-[11px] text-[#555] transition-colors hover:bg-white/[0.03] hover:text-[#888]"
                            >
                              Ver
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
