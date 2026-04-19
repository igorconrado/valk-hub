export const NOTIFICATION_ROUTES: Record<string, (id: string) => string> = {
  task: (id) => `/tasks?taskId=${id}`,
  project: (id) => `/projects/${id}`,
  meeting: (id) => `/meetings/${id}`,
  decision: () => `/meetings`,
  action_item: () => `/meetings`,
  report: (id) => `/reports/${id}`,
  document: (id) => `/docs/${id}`,
};

export const NOTIFICATION_ICONS: Record<string, string> = {
  task_assigned: "✓",
  task_blocked: "⚠",
  task_unblocked: "✓",
  meeting_scheduled: "📅",
  meeting_reminder: "🔔",
  decision_registered: "●",
  action_item_assigned: "→",
  report_published: "📊",
  member_added: "+",
  mention: "@",
};
