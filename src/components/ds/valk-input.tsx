"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ValkInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  prefixIcon?: React.ReactNode
  suffix?: React.ReactNode
  error?: boolean
}

export const ValkInput = React.forwardRef<HTMLInputElement, ValkInputProps>(
  ({ className, prefixIcon, suffix, error, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center", className)}>
        {prefixIcon && (
          <span
            className="absolute left-3.5 flex items-center pointer-events-none"
            style={{ color: "var(--text-ghost)" }}
          >
            {prefixIcon}
          </span>
        )}
        <input
          ref={ref}
          className="input"
          style={{
            paddingLeft: prefixIcon ? 36 : undefined,
            paddingRight: suffix ? 36 : undefined,
            borderColor: error ? "var(--primary)" : undefined,
            boxShadow: error ? "0 0 0 3px rgba(226,75,74,0.06)" : undefined,
          }}
          {...props}
        />
        {suffix && (
          <span
            className="absolute right-3.5 flex items-center"
            style={{ color: "var(--text-ghost)" }}
          >
            {suffix}
          </span>
        )}
      </div>
    )
  }
)

ValkInput.displayName = "ValkInput"
