"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

function ValkTabs({ className, ...props }: React.ComponentProps<typeof Tabs>) {
  return <Tabs className={cn("gap-0", className)} {...props} />
}

function ValkTabsList({ className, ...props }: React.ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      variant="line"
      className={cn(
        "w-full justify-start gap-1 rounded-none border-b border-b-[var(--border-subtle)] bg-transparent p-0",
        className
      )}
      {...props}
    />
  )
}

function ValkTabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(
        "relative rounded-none border-none px-3.5 py-2.5 font-sans text-xs font-medium",
        "text-[var(--text-faint)] hover:text-[var(--text-secondary)]",
        "data-active:text-[var(--text-primary)] data-active:shadow-none",
        "after:absolute after:bottom-[-1px] after:left-2.5 after:right-2.5 after:h-0.5 after:rounded-t after:bg-[var(--primary)] after:opacity-0 data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function ValkTabsContent({ className, ...props }: React.ComponentProps<typeof TabsContent>) {
  return <TabsContent className={cn("pt-4", className)} {...props} />
}

export { ValkTabs, ValkTabsList, ValkTabsTrigger, ValkTabsContent }
