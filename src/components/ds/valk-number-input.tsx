"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Minus, Plus } from "lucide-react"

interface ValkNumberInputProps {
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  className?: string
  disabled?: boolean
}

export function ValkNumberInput({
  value = 0,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  className,
  disabled = false,
}: ValkNumberInputProps) {
  const clamp = (n: number) => {
    if (min !== undefined && n < min) return min
    if (max !== undefined && n > max) return max
    return n
  }

  const decrement = () => onChange?.(clamp(value - step))
  const increment = () => onChange?.(clamp(value + step))

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d.-]/g, "")
    const num = parseFloat(raw)
    if (!isNaN(num)) onChange?.(clamp(num))
  }

  const btnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: "100%",
    color: "var(--text-muted)",
    background: "transparent",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: `color var(--t-fast) var(--ease)`,
    flexShrink: 0,
  }

  return (
    <div
      className={cn("flex items-center", className)}
      style={{
        background: "var(--bg-input)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        overflow: "hidden",
        transition: `border-color var(--t-med) var(--ease)`,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || (min !== undefined && value <= min)}
        style={btnStyle}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <Minus size={14} />
      </button>

      <div
        className="flex-1 flex items-center justify-center gap-1 font-mono"
        style={{ minWidth: 0 }}
      >
        {prefix && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{prefix}</span>
        )}
        <input
          type="text"
          value={value}
          onChange={handleInput}
          disabled={disabled}
          className="font-mono"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            textAlign: "center",
            color: "var(--text-primary)",
            fontSize: 13,
            fontFeatureSettings: '"tnum"',
            width: "100%",
            padding: "9px 0",
          }}
        />
        {suffix && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{suffix}</span>
        )}
      </div>

      <button
        type="button"
        onClick={increment}
        disabled={disabled || (max !== undefined && value >= max)}
        style={btnStyle}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
