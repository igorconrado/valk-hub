import type { ViewFilters } from "@/types/task-view";

interface FilterableTask {
  project_id: string | null;
  sprint_id?: string | null;
  assignee_id: string;
  status: string;
  priority: string;
  type: string;
  due_date: string | null;
  title: string;
}

interface ApplyFiltersContext {
  currentUserId: string;
  activeSprintIds: string[];
}

export function applyViewFilters<T extends FilterableTask>(
  tasks: T[],
  filters: ViewFilters,
  ctx: ApplyFiltersContext
): T[] {
  let result = tasks;

  if (filters.product_id && filters.product_id !== "all") {
    result = result.filter((t) => t.project_id === filters.product_id);
  }

  if (filters.sprint_id === "active") {
    result = result.filter(
      (t) => t.sprint_id && ctx.activeSprintIds.includes(t.sprint_id)
    );
  } else if (filters.sprint_id && filters.sprint_id !== "all") {
    result = result.filter((t) => t.sprint_id === filters.sprint_id);
  }

  if (filters.assignee_id === "me") {
    result = result.filter((t) => t.assignee_id === ctx.currentUserId);
  } else if (filters.assignee_id === "unassigned") {
    result = result.filter((t) => !t.assignee_id);
  } else if (filters.assignee_id && filters.assignee_id !== "all") {
    result = result.filter((t) => t.assignee_id === filters.assignee_id);
  }

  if (Array.isArray(filters.status) && filters.status.length > 0) {
    result = result.filter((t) => filters.status!.includes(t.status));
  }

  if (Array.isArray(filters.priority) && filters.priority.length > 0) {
    result = result.filter((t) => filters.priority!.includes(t.priority));
  }

  if (Array.isArray(filters.type) && filters.type.length > 0) {
    result = result.filter((t) => filters.type!.includes(t.type));
  }

  if (filters.due_date_filter) {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    if (filters.due_date_filter === "overdue") {
      result = result.filter(
        (t) => t.due_date && new Date(t.due_date) < startOfToday
      );
    } else if (filters.due_date_filter === "today") {
      result = result.filter((t) => {
        if (!t.due_date) return false;
        const d = new Date(t.due_date);
        return d >= startOfToday && d < new Date(startOfToday.getTime() + 86400000);
      });
    } else if (filters.due_date_filter === "this_week") {
      result = result.filter((t) => {
        if (!t.due_date) return false;
        const d = new Date(t.due_date);
        return d >= startOfToday && d <= endOfWeek;
      });
    }
  }

  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter((t) => t.title.toLowerCase().includes(q));
  }

  return result;
}
