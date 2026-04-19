"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface FilterPillProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function FilterPill({ label, value, options, onChange }: FilterPillProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);
  const isDefault = value === options[0]?.value;

  // Click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center rounded-full font-sans transition-all duration-150"
        style={{
          padding: "6px 12px",
          fontSize: 11,
          fontWeight: 500,
          border: "1px solid",
          borderColor: isDefault ? "#1F1F1F" : "rgba(226,75,74,0.2)",
          background: isDefault ? "transparent" : "rgba(226,75,74,0.04)",
          color: isDefault ? "var(--text-secondary)" : "var(--primary)",
        }}
        onMouseEnter={(e) => {
          if (isDefault) {
            e.currentTarget.style.borderColor = "#2A2A2A";
            e.currentTarget.style.background = "#0D0D0D";
          }
        }}
        onMouseLeave={(e) => {
          if (isDefault) {
            e.currentTarget.style.borderColor = "#1F1F1F";
            e.currentTarget.style.background = "transparent";
          }
        }}
      >
        <span style={{ color: "#555" }}>{label}:</span>
        <span className="ml-1" style={{ color: isDefault ? "#AAA" : "var(--primary)" }}>
          {current?.label ?? value}
        </span>
        <ChevronDown size={12} className="ml-2 shrink-0" style={{ opacity: 0.6 }} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-30"
          style={{
            marginTop: 4,
            background: "#0A0A0A",
            border: "1px solid #1F1F1F",
            borderRadius: 8,
            minWidth: 180,
            maxHeight: 300,
            overflowY: "auto",
            padding: 4,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-md text-left font-sans transition-colors duration-100"
                style={{
                  padding: "8px 12px",
                  fontSize: 13,
                  color: selected ? "var(--text-primary)" : "var(--text-secondary)",
                  background: selected ? "rgba(255,255,255,0.04)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!selected) e.currentTarget.style.background = "#141414";
                }}
                onMouseLeave={(e) => {
                  if (!selected) e.currentTarget.style.background = "transparent";
                }}
              >
                {opt.label}
                {selected && <Check size={13} style={{ color: "var(--primary)" }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
