"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check, Search } from "lucide-react"

export interface ValkSelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  badge?: React.ReactNode
}

interface ValkSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  options: ValkSelectOption[]
  placeholder?: string
  searchable?: boolean
  className?: string
  disabled?: boolean
  name?: string
}

export function ValkSelect({
  value,
  onValueChange,
  options,
  placeholder = "Selecionar...",
  searchable = false,
  className,
  disabled = false,
  name,
}: ValkSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const autoId = React.useId()
  const listboxId = `valk-select-${autoId}-listbox`

  const selected = options.find((o) => o.value === value)

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  React.useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 0)
    }
    if (!open) {
      setSearch("")
      setActiveIndex(-1)
    }
  }, [open, searchable])

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault()
        onValueChange?.(filtered[activeIndex].value)
        setOpen(false)
        buttonRef.current?.focus()
      } else if (e.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, activeIndex, filtered, onValueChange])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 font-sans"
        style={{
          background: "var(--bg-input)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8,
          padding: "9px 12px",
          color: selected ? "var(--text-primary)" : "var(--text-ghost)",
          fontSize: 13,
          transition: `all var(--t-med) var(--ease)`,
          outline: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlur={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget)) {
            e.currentTarget.style.borderColor = "var(--border-subtle)"
          }
        }}
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.icon}
          {selected?.label ?? placeholder}
          {selected?.badge}
        </span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          style={{
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: `transform var(--t-fast) var(--ease)`,
          }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            boxShadow: "var(--shadow-card)",
            animation: "scaleIn var(--t-fast) var(--ease) both",
          }}
        >
          {searchable && (
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <Search size={13} style={{ color: "var(--text-ghost)", flexShrink: 0 }} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="font-sans"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: 12,
                  width: "100%",
                }}
              />
            </div>
          )}

          <ul id={listboxId} role="listbox" className="max-h-[200px] overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li
                className="px-3 py-2 font-sans"
                style={{ color: "var(--text-muted)", fontSize: 12 }}
              >
                Nenhum resultado
              </li>
            )}
            {filtered.map((option, idx) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 font-sans"
                style={{
                  fontSize: 13,
                  color: "var(--text-primary)",
                  background: idx === activeIndex ? "var(--bg-elev)" : "transparent",
                  transition: `background var(--t-fast) var(--ease)`,
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(-1)}
                onClick={() => {
                  onValueChange?.(option.value)
                  setOpen(false)
                  buttonRef.current?.focus()
                }}
              >
                {option.icon}
                <span className="flex-1 truncate text-left">{option.label}</span>
                {option.badge}
                {option.value === value && (
                  <Check size={14} aria-hidden="true" style={{ color: "var(--primary)", flexShrink: 0 }} />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
