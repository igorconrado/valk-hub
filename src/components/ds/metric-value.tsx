interface MetricValueProps {
  value: number | string
  delta?: number
  prefix?: string
  suffix?: string
}

export function MetricValue({ value, delta, prefix = "", suffix = "" }: MetricValueProps) {
  const formatted = typeof value === "number" ? value.toLocaleString("pt-BR") : value

  return (
    <div className="flex items-baseline gap-2.5">
      <span
        className="font-display"
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          fontFeatureSettings: '"tnum"',
        }}
      >
        {prefix}{formatted}{suffix}
      </span>
      {delta !== undefined && delta !== 0 && (
        <span
          className="font-mono"
          style={{
            fontSize: 11,
            color: delta > 0 ? "var(--status-traction)" : "var(--status-scale)",
            fontFeatureSettings: '"tnum"',
          }}
        >
          {delta > 0 ? "\u2191" : "\u2193"}{Math.abs(delta).toFixed(1)}%
        </span>
      )}
    </div>
  )
}
