"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns"
import { ptBR } from "date-fns/locale"

interface ValkDatePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  placeholder?: string
  className?: string
}

export function ValkDatePicker({
  value,
  onChange,
  placeholder = "Selecionar data...",
  className,
}: ValkDatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [viewDate, setViewDate] = React.useState(value ?? new Date())
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calStart = startOfWeek(monthStart, { locale: ptBR })
  const calEnd = endOfWeek(monthEnd, { locale: ptBR })

  const days: Date[] = []
  let day = calStart
  while (day <= calEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 font-sans"
        style={{
          background: "var(--bg-input)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8,
          padding: "9px 12px",
          color: value ? "var(--text-primary)" : "var(--text-ghost)",
          fontSize: 13,
          transition: `all var(--t-med) var(--ease)`,
          outline: "none",
        }}
      >
        <Calendar size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <span className="flex-1 text-left truncate">
          {value ? format(value, "dd 'de' MMMM, yyyy", { locale: ptBR }) : placeholder}
        </span>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 10,
            boxShadow: "var(--shadow-card)",
            padding: 14,
            width: 280,
            animation: "scaleIn var(--t-fast) var(--ease) both",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              style={{
                color: "var(--text-muted)",
                padding: 4,
                borderRadius: 4,
                transition: `color var(--t-fast) var(--ease)`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <ChevronLeft size={16} />
            </button>
            <span
              className="font-display"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-primary)",
                textTransform: "capitalize",
              }}
            >
              {format(viewDate, "MMMM yyyy", { locale: ptBR })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              style={{
                color: "var(--text-muted)",
                padding: 4,
                borderRadius: 4,
                transition: `color var(--t-fast) var(--ease)`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-1">
            {dayNames.map((d) => (
              <div
                key={d}
                className="text-center font-sans"
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  padding: "4px 0",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              const selected = value && isSameDay(d, value)
              const inMonth = isSameMonth(d, viewDate)
              const today = isToday(d)

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange?.(d)
                    setOpen(false)
                  }}
                  className="font-sans"
                  style={{
                    width: 34,
                    height: 34,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: selected ? 600 : 400,
                    color: selected
                      ? "#fff"
                      : inMonth
                        ? "var(--text-primary)"
                        : "var(--text-ghost)",
                    background: selected ? "var(--primary)" : "transparent",
                    boxShadow: today && !selected
                      ? "inset 0 0 0 1px var(--primary-border)"
                      : "none",
                    transition: `all var(--t-fast) var(--ease)`,
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.background = "var(--bg-elev)"
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) e.currentTarget.style.background = "transparent"
                  }}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
