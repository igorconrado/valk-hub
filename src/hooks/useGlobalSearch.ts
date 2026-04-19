"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type SearchResult = {
  entity_type: "task" | "project" | "document" | "meeting" | "user";
  entity_id: string;
  title: string;
  subtitle: string;
  meta: string;
  rank: number;
};

export function useGlobalSearch(query: string, limit: number = 20) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const { data, error: rpcError } = await supabase.rpc(
          "global_search",
          {
            search_query: query.trim(),
            result_limit: limit,
          }
        );

        if (cancelled) return;

        if (rpcError) {
          setError(rpcError.message);
          setResults([]);
        } else {
          setResults((data as SearchResult[]) ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erro na busca");
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query, limit]);

  return { results, loading, error };
}
