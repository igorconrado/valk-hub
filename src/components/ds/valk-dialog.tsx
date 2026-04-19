"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const sizeMap = {
  md: "sm:max-w-[560px]",
  lg: "sm:max-w-[760px]",
} as const

interface ValkDialogProps {
  open?: boolean
  onClose: () => void
  title: string
  subtitle?: string
  size?: keyof typeof sizeMap
  footer?: React.ReactNode
  children?: React.ReactNode
}

function ValkDialog({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  footer,
  children,
}: ValkDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      <DialogContent
        className={cn(
          "w-[calc(100%-2rem)] gap-0 rounded-[var(--r-xl)] border border-[var(--border-default)] bg-[var(--bg-1)] p-0 sm:w-auto",
          sizeMap[size]
        )}
        showCloseButton={false}
      >
        {/* Header */}
        <div className="shrink-0 px-6 pt-6">
          <DialogHeader className="gap-1">
            <DialogTitle className="font-display text-[17px] font-semibold text-[var(--text-primary)]">
              {title}
            </DialogTitle>
            {subtitle && (
              <DialogDescription className="font-sans text-[12px] text-[var(--text-muted)]">
                {subtitle}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="mt-5 h-px bg-[#141414]" />
        </div>

        {/* Body */}
        {children && (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5">
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <DialogFooter className="border-t border-[#141414] px-6 py-5">
            <div className="flex justify-end gap-2.5">{footer}</div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { ValkDialog }
