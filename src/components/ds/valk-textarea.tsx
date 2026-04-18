"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ValkTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  autoResize?: boolean
}

export const ValkTextarea = React.forwardRef<HTMLTextAreaElement, ValkTextareaProps>(
  ({ className, error, autoResize, onChange, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null)

    const handleResize = React.useCallback(() => {
      const el = internalRef.current
      if (el && autoResize) {
        el.style.height = "auto"
        el.style.height = el.scrollHeight + "px"
      }
    }, [autoResize])

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleResize()
        onChange?.(e)
      },
      [handleResize, onChange]
    )

    return (
      <textarea
        ref={(node) => {
          internalRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        className={cn("input resize-none", className)}
        style={{
          minHeight: 80,
          borderColor: error ? "var(--primary)" : undefined,
          boxShadow: error ? "0 0 0 3px rgba(226,75,74,0.06)" : undefined,
        }}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

ValkTextarea.displayName = "ValkTextarea"
