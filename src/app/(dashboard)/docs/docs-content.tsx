"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  FileText,
  BookOpen,
  Code,
  Lightbulb,
  FileCheck,
  Layout,
  BarChart3,
  PenLine,
  Plus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { CreateDocumentDialog } from "./create-document-dialog";

type DocRow = {
  id: string;
  title: string;
  type: string;
  project_id: string | null;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  author: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
};

type FilterProject = { id: string; name: string };
type FilterUser = { id: string; name: string };

const TYPE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "contexto", label: "Contexto" },
  { value: "prd", label: "PRD" },
  { value: "spec", label: "Spec" },
  { value: "aprendizado", label: "Aprendizado" },
  { value: "ata", label: "Ata" },
  { value: "template", label: "Template" },
  { value: "relatorio", label: "Relatorio" },
  { value: "livre", label: "Livre" },
];

const typeIcons: Record<string, { icon: typeof FileText; color: string }> = {
  contexto: { icon: FileText, color: "#5B9BF0" },
  prd: { icon: BookOpen, color: "#A07EF0" },
  spec: { icon: Code, color: "#3DC9A0" },
  aprendizado: { icon: Lightbulb, color: "#E8A840" },
  ata: { icon: FileCheck, color: "#888" },
  template: { icon: Layout, color: "#666" },
  relatorio: { icon: BarChart3, color: "#E86B6A" },
  livre: { icon: PenLine, color: "#555" },
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
  active,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  active: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`shrink-0 appearance-none rounded-lg border bg-[#0A0A0A] px-2.5 py-1.5 text-[11px] font-medium text-[#888] outline-none transition-colors duration-150 ${
        active
          ? "border-[rgba(226,75,74,0.3)]"
          : "border-[#1A1A1A] hover:border-[#2A2A2A]"
      }`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {label}: {opt.label}
        </option>
      ))}
    </select>
  );
}

function DocIcon({ type }: { type: string }) {
  const config = typeIcons[type] ?? { icon: FileText, color: "#555" };
  const Icon = config.icon;
  return <Icon size={18} strokeWidth={1.5} style={{ color: config.color }} />;
}

export function DocsContent({
  docs,
  projects,
  users,
}: {
  docs: DocRow[];
  projects: FilterProject[];
  users: FilterUser[];
}) {
  const [filterProject, setFilterProject] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterAuthor, setFilterAuthor] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DocRow[] | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const projectOptions = [
    { value: "all", label: "Todos" },
    { value: "company", label: "Empresa" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  const authorOptions = [
    { value: "all", label: "Todos" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults(null);
        setSearching(false);
        return;
      }

      setSearching(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("documents")
        .select(
          "*, author:users!created_by(id, name), project:projects!project_id(id, name)"
        )
        .textSearch("search_vector", query.trim(), { type: "websearch" })
        .order("updated_at", { ascending: false })
        .limit(50);

      setSearchResults((data as DocRow[]) ?? []);
      setSearching(false);
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, handleSearch]);

  const baseDocs = searchResults ?? docs;

  const filtered = baseDocs.filter((d) => {
    if (filterProject === "company" && d.project_id !== null) return false;
    if (
      filterProject !== "all" &&
      filterProject !== "company" &&
      d.project_id !== filterProject
    )
      return false;
    if (filterType !== "all" && d.type !== filterType) return false;
    if (filterAuthor !== "all" && d.created_by !== filterAuthor) return false;
    return true;
  });

  return (
    <div>
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          strokeWidth={1.5}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar em todos os documentos..."
          className="w-full rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] py-2.5 pl-10 pr-4 text-[13px] text-[#ddd] placeholder-[#333] outline-none transition-colors duration-150 focus:border-[#E24B4A] focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.06)]"
        />
        {searching && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-[#333] border-t-[#E24B4A]" />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <FilterSelect
          label="Produto"
          value={filterProject}
          options={projectOptions}
          onChange={setFilterProject}
          active={filterProject !== "all"}
        />
        <FilterSelect
          label="Tipo"
          value={filterType}
          options={TYPE_OPTIONS}
          onChange={setFilterType}
          active={filterType !== "all"}
        />
        <FilterSelect
          label="Autor"
          value={filterAuthor}
          options={authorOptions}
          onChange={setFilterAuthor}
          active={filterAuthor !== "all"}
        />
      </div>

      {/* Document list */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText
              size={28}
              strokeWidth={1.2}
              className="text-[#1A1A1A]"
            />
            <p className="mt-3 text-[13px] text-[#444]">
              {searchQuery
                ? "Nenhum resultado encontrado."
                : "Nenhum documento ainda."}
            </p>
            {!searchQuery && (
              <CreateDocumentDialog>
                <button className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#E24B4A] px-4 py-2 text-[12px] font-medium text-white transition-colors duration-150 hover:bg-[#D4403F]">
                  <Plus size={14} strokeWidth={1.5} />
                  Criar primeiro doc
                </button>
              </CreateDocumentDialog>
            )}
          </div>
        ) : (
          filtered.map((doc, i) => {
            const timeAgo = formatDistanceToNow(new Date(doc.updated_at), {
              addSuffix: true,
              locale: ptBR,
            });

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.025 }}
              >
                <Link
                  href={`/docs/${doc.id}`}
                  className="flex items-center gap-4 border-b border-[#0F0F0F] py-3.5 transition-colors duration-150 hover:bg-white/[0.02]"
                >
                  {/* Type icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#141414] bg-[#0A0A0A]">
                    <DocIcon type={doc.type} />
                  </div>

                  {/* Title + meta */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-[#ddd]">
                      {doc.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                      <span className="text-[#555]">
                        {doc.project?.name ?? "Empresa"}
                      </span>
                      <span className="text-[#222]">·</span>
                      <span className="text-[#444]">
                        por {doc.author?.name ?? "Desconhecido"}
                      </span>
                      <span className="text-[#222]">·</span>
                      <span className="text-[#333]">editado {timeAgo}</span>
                    </div>
                  </div>

                  {/* Version */}
                  <span className="shrink-0 font-mono text-[10px] text-[#444]">
                    v{doc.version}
                  </span>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
