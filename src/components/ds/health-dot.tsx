interface HealthDotProps {
  state?: "good" | "warn" | "bad" | "neutral"
}

const colorMap = {
  good: "var(--status-traction)",
  warn: "var(--priority-high)",
  bad: "var(--status-scale)",
  neutral: "var(--text-muted)",
} as const

export function HealthDot({ state = "good" }: HealthDotProps) {
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: colorMap[state],
        display: "inline-block",
        flexShrink: 0,
        boxShadow: state === "bad" ? "0 0 8px rgba(226,75,74,0.4)" : "none",
      }}
    />
  )
}
