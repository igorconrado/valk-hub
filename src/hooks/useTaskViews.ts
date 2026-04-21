"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TaskView } from "@/types/task-view";

export function useTaskViews() {
  const [views, setViews] = useState<TaskView[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViews = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_visible_task_views");
    if (!error && data) {
      setViews(data as TaskView[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchViews();
  }, [fetchViews]);

  const toggleFavorite = useCallback(
    async (viewId: string) => {
      const supabase = createClient();
      const { error } = await supabase.rpc("toggle_view_favorite", {
        p_view_id: viewId,
      });
      if (!error) await fetchViews();
    },
    [fetchViews]
  );

  return { views, loading, refetch: fetchViews, toggleFavorite };
}
