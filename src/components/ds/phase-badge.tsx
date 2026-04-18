export type Phase = "discovery" | "mvp" | "validation" | "traction" | "scale" | "paused"

const phaseLabels: Record<Phase, string> = {
  discovery: "Discovery",
  mvp: "MVP",
  validation: "Validation",
  traction: "Traction",
  scale: "Scale",
  paused: "Pausado",
}

interface PhaseBadgeProps {
  phase: Phase
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  return (
    <span className={`badge ${phase}`}>
      <span className="dot" />
      {phaseLabels[phase]}
    </span>
  )
}
