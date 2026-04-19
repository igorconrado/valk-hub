"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Loader2,
  CheckSquare,
  Briefcase,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useGlobalSearch, type SearchResult } from "@/hooks/useGlobalSearch";

interface SearchCommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const TYPE_CONFIG: Record<
  SearchResult["entity_type"],
  { icon: typeof CheckSquare; bg: string; color: string }
> = {
  task: { icon: CheckSquare, bg: "rgba(59,130,246,0.1)", color: "#60A5FA" },
  project: { icon: Briefcase, bg: "rgba(226,75,74,0.1)", color: "#E24B4A" },
  document: { icon: FileText, bg: "rgba(139,92,246,0.1)", color: "#A78BFA" },
  meeting: { icon: Calendar, bg: "rgba(16,185,129,0.1)", color: "#34D399" },
  user: { icon: User, bg: "rgba(245,158,11,0.1)", color: "#FBBF24" },
};

const ENTITY_ROUTES: Record<SearchResult["entity_type"], (id: string) => string> = {
  task: (id) => `/tasks?taskId=${id}`,
  project: (id) => `/projects/${id}`,
  document: (id) => `/docs/${id}`,
  meeting: (id) => `/meetings/${id}`,
  user: (id) => `/people/${id}`,
};

type GroupKey = SearchResult["entity_type"];
const GROUP_ORDER: GroupKey[] = ["task", "project", "document", "meeting", "user"];

function groupResults(results: SearchResult[]) {
  const grouped = new Map<GroupKey, SearchResult[]>();
  for (const r of results) {
    const list = grouped.get(r.entity_type) ?? [];
    list.push(r);
    grouped.set(r.entity_type, list);
  }
  return GROUP_ORDER.filter((k) => grouped.has(k)).map((k) => ({
    type: k,
    items: grouped.get(k)!,
  }));
}

export function SearchCommandPalette({ open, onClose }: SearchCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations("search");
  const { results, loading } = useGlobalSearch(query);

  const groups = groupResults(results);
  const flatResults = groups.flatMap((g) => g.items);

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const navigate = useCallback(
    (result: SearchResult) => {
      const route = ENTITY_ROUTES[result.entity_type](result.entity_id);
      router.push(route);
      onClose();
    },
    [router, onClose]
  );

  // Scroll selected into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector("[data-selected='true']");
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && flatResults[selectedIndex]) {
      e.preventDefault();
      navigate(flatResults[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  if (!open) return null;

  const isEmpty = query.trim().length < 2;
  const noResults = !isEmpty && !loading && flatResults.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          {/* Container */}
          <motion.div
            className="fixed inset-x-0 z-50 mx-auto w-[calc(100%-2rem)] sm:w-full sm:max-w-[640px]"
            style={{ top: "15vh" }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onKeyDown={handleKeyDown}
          >
            <div className="overflow-hidden rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] shadow-2xl">
              {/* Input */}
              <div className="flex items-center gap-3 px-5" style={{ height: 56 }}>
                <Search size={16} className="shrink-0 text-[#555]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("placeholder")}
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-[#EEE] placeholder-[#555] outline-none"
                />
                {loading && (
                  <Loader2 size={14} className="shrink-0 animate-spin text-[#555]" />
                )}
                {query && !loading && (
                  <button
                    onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                    className="shrink-0 rounded p-0.5 text-[#555] transition-colors hover:text-[#888]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Separator */}
              <div className="h-px bg-[#1F1F1F]" />

              {/* Results / empty / no-results */}
              <div
                ref={listRef}
                className="overflow-y-auto"
                style={{ maxHeight: "60vh" }}
              >
                {isEmpty && (
                  <div className="px-5 py-8 text-center text-[13px] text-[#555]">
                    {t("emptyState")}
                  </div>
                )}

                {noResults && (
                  <div className="px-5 py-8 text-center text-[13px] text-[#555]">
                    {t("noResults", { query })}
                  </div>
                )}

                {groups.map((group) => {
                  const groupLabel = t(`groups.${group.type}` as "groups.task");
                  return (
                    <div key={group.type}>
                      <div
                        className="px-5 pt-3 pb-2 font-mono text-[10px] uppercase text-[#444]"
                        style={{ letterSpacing: "0.1em" }}
                      >
                        {groupLabel}
                      </div>
                      {group.items.map((item) => {
                        const globalIdx = flatResults.indexOf(item);
                        const isSelected = globalIdx === selectedIndex;
                        const cfg = TYPE_CONFIG[item.entity_type];
                        const Icon = cfg.icon;

                        return (
                          <button
                            key={`${item.entity_type}-${item.entity_id}`}
                            data-selected={isSelected}
                            onClick={() => navigate(item)}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors"
                            style={{
                              background: isSelected ? "#141414" : "transparent",
                              borderLeft: isSelected ? "2px solid #E24B4A" : "2px solid transparent",
                            }}
                          >
                            <div
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                              style={{ background: cfg.bg }}
                            >
                              <Icon size={13} style={{ color: cfg.color }} />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <span className="truncate text-[14px] font-medium text-[#DDD]">
                                {item.title}
                              </span>
                              {(item.subtitle || item.meta) && (
                                <span className="truncate font-mono text-[11px] text-[#666]">
                                  {[item.subtitle, item.meta].filter(Boolean).join(" · ")}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[#1F1F1F] px-5 py-2">
                <span className="font-mono text-[10px] text-[#444]">
                  ↑↓ {t("footer.navigate")} · Enter {t("footer.open")} · Esc {t("footer.close")}
                </span>
                {flatResults.length > 0 && (
                  <span className="font-mono text-[10px] text-[#444]">
                    {flatResults.length} {t("footer.results")}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
