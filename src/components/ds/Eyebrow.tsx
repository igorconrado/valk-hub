"use client";

import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "h2" | "h3" | "p" | "label";
}

export function Eyebrow({ children, className, as: Tag = "span" }: EyebrowProps) {
  return (
    <Tag className={cn("eyebrow", className)}>
      {children}
    </Tag>
  );
}
