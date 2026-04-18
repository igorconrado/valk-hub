"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ValkCheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  label?: string
}

export function ValkCheckbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  label,
}: ValkCheckboxProps) {
  return (
    <label
      className={cn("inline-flex items-center gap-2 select-none", className)}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className="inline-flex items-center justify-center shrink-0"
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: `1px solid ${checked ? "var(--primary)" : "var(--border-default)"}`,
          background: checked ? "var(--primary)" : "transparent",
          transition: `all var(--t-fast) var(--ease)`,
          outline: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,75,74,0.06)"
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none"
        }}
      >
        {checked && <Check size={12} strokeWidth={2.5} color="#fff" />}
      </button>
      {label && (
        <span className="font-sans" style={{ fontSize: 13, color: "var(--text-primary)" }}>
          {label}
        </span>
      )}
    </label>
  )
}
