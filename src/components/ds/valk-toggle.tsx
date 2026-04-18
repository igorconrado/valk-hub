"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ValkToggleProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function ValkToggle({ checked = false, onCheckedChange, disabled = false, className }: ValkToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn("relative inline-flex shrink-0 cursor-pointer items-center rounded-full", className)}
      style={{
        width: 36,
        height: 20,
        background: checked ? "var(--primary)" : "var(--border-default)",
        transition: `background var(--t-fast) var(--ease)`,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: checked ? "#fff" : "var(--text-muted)",
          transform: checked ? "translateX(19px)" : "translateX(3px)",
          transition: `all var(--t-fast) var(--ease)`,
        }}
      />
    </button>
  )
}
