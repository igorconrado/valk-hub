"use client";

import type { ReactNode } from "react";

export interface SegmentedProps<T extends string> {
  options: { value: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div
      className="inline-flex rounded-lg"
      style={{
        border: "1px solid #1F1F1F",
        background: "#0A0A0A",
        padding: 2,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="inline-flex items-center rounded-md font-sans transition-all duration-150"
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 500,
              gap: 6,
              color: active ? "#EEE" : "#666",
              background: active ? "#1A1A1A" : "transparent",
              boxShadow: active
                ? "0 1px 2px rgba(0,0,0,0.3)"
                : "none",
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = "#141414";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = "transparent";
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
