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
  decimals?: number
  prefix?: string
  suffix?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function ValkNumberInput({
  value = 0,
  onChange,
  min,
  max,
  step,
  decimals = 0,
  prefix,
  suffix,
  placeholder,
  className,
  disabled = false,
}: ValkNumberInputProps) {
  const resolvedStep = step ?? (decimals > 0 ? 1 / Math.pow(10, decimals) : 1)

  const clamp = (n: number) => {
    if (min !== undefined && n < min) return min
    if (max !== undefined && n > max) return max
    return n
  }

  const round = (n: number) => {
    if (decimals <= 0) return Math.round(n)
    const factor = Math.pow(10, decimals)
    return Math.round(n * factor) / factor
  }

  const decrement = () => onChange?.(round(clamp(value - resolvedStep)))
  const increment = () => onChange?.(round(clamp(value + resolvedStep)))

  const formatDisplay = (v: number): string => {
    if (decimals > 0) {
      return v.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    }
    return v.toLocaleString("pt-BR")
  }

  const [inputValue, setInputValue] = React.useState(formatDisplay(value))
  const [focused, setFocused] = React.useState(false)

  // Sync display when value changes externally (not while user is typing)
  React.useEffect(() => {
    if (!focused) {
      setInputValue(formatDisplay(value))
    }
  }, [value, focused, decimals])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInputValue(raw)

    // Parse pt-BR formatted input: "500.000,50" -> 500000.50
    const cleaned = raw.replace(/[^\d,.-]/g, "")
    let num: number
    if (cleaned.includes(",") && cleaned.includes(".")) {
      num = parseFloat(cleaned.replace(/\./g, "").replace(",", "."))
    } else if (cleaned.includes(",")) {
      num = parseFloat(cleaned.replace(",", "."))
    } else {
      num = parseFloat(cleaned)
    }

    if (!isNaN(num)) onChange?.(clamp(round(num)))
  }

  const handleBlur = () => {
    setFocused(false)
    setInputValue(formatDisplay(value))
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
          inputMode="decimal"
          value={inputValue}
          onChange={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
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
