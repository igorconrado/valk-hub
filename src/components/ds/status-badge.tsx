export type TaskStatus = "backlog" | "doing" | "on_hold" | "review" | "done" | "cancelled"

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; border: string }> = {
  backlog: {
    label: "Backlog",
    color: "var(--text-secondary)",
    bg: "rgba(255,255,255,0.02)",
    border: "var(--border-default)",
  },
  doing: {
    label: "Em andamento",
    color: "#7FB0F5",
    bg: "rgba(59,130,246,0.06)",
    border: "rgba(59,130,246,0.14)",
  },
  on_hold: {
    label: "Em espera",
    color: "#F5BD5C",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.14)",
  },
  review: {
    label: "Revisao",
    color: "#B49DF5",
    bg: "rgba(139,92,246,0.06)",
    border: "rgba(139,92,246,0.14)",
  },
  done: {
    label: "Concluido",
    color: "#58D3AE",
    bg: "rgba(16,185,129,0.06)",
    border: "rgba(16,185,129,0.14)",
  },
  cancelled: {
    label: "Cancelado",
    color: "#9CA3AF",
    bg: "rgba(107,114,128,0.06)",
    border: "rgba(107,114,128,0.14)",
  },
}

interface StatusBadgeProps {
  status: TaskStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap font-sans"
      style={{
        fontSize: 10,
        fontWeight: 500,
        padding: "2.5px 7px",
        borderRadius: 4,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
        lineHeight: 1.4,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: config.color,
          display: "inline-block",
        }}
      />
      {config.label}
    </span>
  )
}
