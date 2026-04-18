"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export interface ValkDropdownItem {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  destructive?: boolean
  disabled?: boolean
}

export interface ValkDropdownSection {
  label?: string
  items: ValkDropdownItem[]
}

interface ValkDropdownProps {
  trigger: React.ReactNode
  sections: ValkDropdownSection[]
  align?: "start" | "center" | "end"
}

export function ValkDropdown({ trigger, sections, align = "end" }: ValkDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="min-w-[180px] border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]"
      >
        {sections.map((section, si) => (
          <React.Fragment key={si}>
            {si > 0 && <DropdownMenuSeparator className="bg-[var(--border-subtle)]" />}
            <DropdownMenuGroup>
              {section.label && (
                <DropdownMenuLabel className="font-sans text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {section.label}
                </DropdownMenuLabel>
              )}
              {section.items.map((item, ii) => (
                <DropdownMenuItem
                  key={ii}
                  variant={item.destructive ? "destructive" : "default"}
                  disabled={item.disabled}
                  onClick={item.onClick}
                  className="gap-2 font-sans text-[13px] text-[var(--text-primary)] focus:bg-[var(--bg-elev)] focus:text-[var(--text-primary)] data-[variant=destructive]:text-[var(--primary)] data-[variant=destructive]:focus:text-[var(--primary)]"
                >
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export {
  DropdownMenu as ValkDropdownRoot,
  DropdownMenuTrigger as ValkDropdownTrigger,
  DropdownMenuContent as ValkDropdownContent,
  DropdownMenuItem as ValkDropdownItem_Primitive,
  DropdownMenuSeparator as ValkDropdownSeparator,
}
