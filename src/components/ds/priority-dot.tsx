export type Priority = "urgent" | "high" | "medium" | "low"

interface PriorityDotProps {
  priority: Priority
}

export function PriorityDot({ priority }: PriorityDotProps) {
  return <span className={`pri ${priority}`} />
}
