"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"

export function ValkToaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--bg-card)",
          "--normal-text": "var(--text-primary)",
          "--normal-border": "var(--border-subtle)",
          "--border-radius": "var(--r-md)",
          "--success-bg": "var(--bg-card)",
          "--success-text": "var(--text-primary)",
          "--success-border": "var(--status-traction)",
          "--error-bg": "var(--bg-card)",
          "--error-text": "var(--text-primary)",
          "--error-border": "var(--primary)",
          "--info-bg": "var(--bg-card)",
          "--info-text": "var(--text-primary)",
          "--info-border": "var(--status-discovery)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "font-sans text-[13px] border-l-[3px]",
          title: "font-sans font-medium text-[var(--text-primary)]",
          description: "font-sans text-[var(--text-secondary)] text-xs",
          success: "border-l-[var(--status-traction)]",
          error: "border-l-[var(--primary)]",
          info: "border-l-[var(--status-discovery)]",
        },
      }}
      {...props}
    />
  )
}
