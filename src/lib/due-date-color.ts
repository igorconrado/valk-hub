/**
 * Returns the appropriate CSS color for a due date based on urgency.
 *
 * - Done tasks: always neutral (muted gray)
 * - >3 days overdue: danger red
 * - 1-3 days overdue or due within 2 days: warning amber
 * - Future (3+ days): neutral gray
 */
export function getDueDateColor(
  dueDate: string | Date,
  status?: string
): string {
  if (status === "done") return "var(--text-faint)";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDate);
  const diffMs = due.getTime() - startOfToday.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < -3) return "var(--danger)";      // severely overdue
  if (diffDays < 0) return "var(--warning)";       // 1-3 days overdue
  if (diffDays <= 2) return "var(--warning)";      // due soon
  return "var(--text-faint)";                       // normal
}
