export type ViewScope = "system" | "workspace" | "personal";

export type ViewFilters = {
  product_id?: string;
  sprint_id?: string;
  assignee_id?: string;
  status?: string[];
  priority?: string[];
  type?: string[];
  due_date_filter?: "overdue" | "today" | "this_week" | null;
  search?: string | null;
};

export interface TaskView {
  id: string;
  slug: string | null;
  name: string;
  icon: string | null;
  scope: ViewScope;
  owner_id: string | null;
  filters: ViewFilters;
  sort_order: number;
  is_favorited: boolean;
}
