"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface ValkDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function ValkDialog({ open, onOpenChange, children }: ValkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

function ValkDialogTrigger({ children, ...props }: React.ComponentProps<typeof DialogTrigger>) {
  return (
    <DialogTrigger asChild {...props}>
      {children}
    </DialogTrigger>
  )
}

function ValkDialogContent({
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogPortal>
      <DialogOverlay
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[8px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      />
      <DialogContent
        className={cn(
          "border-[var(--border-default)] bg-[var(--bg-1)]",
          className
        )}
        style={{
          borderRadius: "var(--r-xl)",
          animation: "scaleIn var(--t-med) var(--ease) both",
        }}
        showCloseButton={showCloseButton}
        {...props}
      >
        {children}
      </DialogContent>
    </DialogPortal>
  )
}

function ValkDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <DialogHeader className={className} {...props} />
}

function ValkDialogFooter({ className, ...props }: React.ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      className={cn("border-t-[var(--border-subtle)] bg-[var(--bg-card)]/50", className)}
      {...props}
    />
  )
}

function ValkDialogTitle({ className, ...props }: React.ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      className={cn("font-display text-base font-semibold text-[var(--text-primary)]", className)}
      {...props}
    />
  )
}

function ValkDialogDescription({ className, ...props }: React.ComponentProps<typeof DialogDescription>) {
  return (
    <DialogDescription
      className={cn("font-sans text-xs text-[var(--text-muted)]", className)}
      {...props}
    />
  )
}

export {
  ValkDialog,
  ValkDialogTrigger,
  ValkDialogContent,
  ValkDialogHeader,
  ValkDialogFooter,
  ValkDialogTitle,
  ValkDialogDescription,
  DialogClose as ValkDialogClose,
}
