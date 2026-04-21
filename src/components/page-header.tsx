import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-end justify-between",
        className
      )}
      style={{ marginBottom: 24 }}
    >
      <div>
        <h1
          className="display"
          style={{
            fontSize: 28,
            fontWeight: 600,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: 12,
              color: "var(--text-faint)",
              margin: "6px 0 0",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2.5">{action}</div>}
    </div>
  );
}
