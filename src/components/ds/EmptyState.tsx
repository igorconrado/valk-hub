"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "page" | "card" | "inline";
  className?: string;
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  variant = "page",
  className,
}: EmptyStateProps) {
  const sizeClasses = {
    page: "py-20 max-w-md",
    card: "py-10 max-w-sm",
    inline: "py-6 max-w-xs",
  }[variant];

  return (
    <motion.div
      className={cn(
        "mx-auto flex flex-col items-center text-center",
        sizeClasses,
        className
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {illustration && (
        <div className="mb-5 text-[var(--primary)] opacity-50">
          {illustration}
        </div>
      )}
      <p
        className={cn(
          "font-display font-semibold",
          variant === "inline" ? "text-[13px]" : "text-[15px]"
        )}
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </p>
      {description && (
        <p
          className="mt-2 text-[12px] leading-relaxed"
          style={{ color: "var(--text-faint)" }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
