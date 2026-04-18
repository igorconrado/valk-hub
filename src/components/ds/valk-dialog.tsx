"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogTrigger,
  DialogClose,
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
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn(
        "gap-0 rounded-[var(--r-xl)] border border-[var(--border-default)] bg-[var(--bg-1)] p-0",
        className
      )}
      showCloseButton={showCloseButton}
      {...props}
    >
      {children}
    </DialogContent>
  )
}

function ValkDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <DialogHeader className={cn("gap-1", className)} {...props} />
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
      className={cn("font-display text-[17px] font-semibold text-[var(--text-primary)]", className)}
      {...props}
    />
  )
}

function ValkDialogDescription({ className, ...props }: React.ComponentProps<typeof DialogDescription>) {
  return (
    <DialogDescription
      className={cn("font-sans text-[12px] text-[var(--text-muted)]", className)}
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
