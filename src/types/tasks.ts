export type TaskType =
  | "dev"
  | "task"
  | "meeting_prep"
  | "report"
  | "research"
  | "decision";

export type TaskStatus =
  | "backlog"
  | "doing"
  | "on_hold"
  | "review"
  | "done"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  type: TaskType;
  assignee_id: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  tags: string[];
  linear_issue_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type TaskBlock = {
  id: string;
  task_id: string;
  reason: string;
  blocked_by_user_id: string | null;
  resolved: boolean;
  resolved_at: string | null;
  created_by: string;
  created_at: string;
};

export type TaskWithRelations = Task & {
  assignee: User;
  project: Project | null;
  blocks: TaskBlock[];
};

type User = {
  id: string;
  name: string;
};

type Project = {
  id: string;
  name: string;
  logo_url: string | null;
};
