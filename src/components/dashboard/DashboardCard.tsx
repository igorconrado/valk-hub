import { type ReactNode } from "react";
import Link from "next/link";

interface DashboardCardProps {
  title: string;
  action?: { label: string; href: string } | null;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ title, action, children, className = "" }: DashboardCardProps) {
  return (
    <section className={`rounded-xl border border-[#141414] bg-[#0A0A0A] p-5 ${className}`}>
      <header className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#444]">
          {title}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="font-mono text-[10px] text-[#666] transition hover:text-[#AAA]"
          >
            {action.label} →
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}
