import { cn } from "@/lib/utils"

interface SkeletonProps {
  variant?: "card" | "row" | "circle" | "text-line"
  className?: string
  width?: number | string
  height?: number | string
}

function SkeletonBase({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-[var(--r-md)] overflow-hidden", className)}
      style={{
        background: "var(--bg-input)",
        border: "1px solid var(--border-subtle)",
        backgroundImage:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
      {...props}
    />
  )
}

export function ValkSkeleton({ variant = "text-line", className, width, height }: SkeletonProps) {
  switch (variant) {
    case "card":
      return (
        <SkeletonBase
          className={cn("rounded-[var(--r-lg)]", className)}
          style={{ width: width ?? "100%", height: height ?? 120 }}
        />
      )
    case "row":
      return (
        <SkeletonBase
          className={className}
          style={{ width: width ?? "100%", height: height ?? 40 }}
        />
      )
    case "circle":
      return (
        <SkeletonBase
          className={cn("rounded-full", className)}
          style={{ width: width ?? 32, height: height ?? 32 }}
        />
      )
    case "text-line":
    default:
      return (
        <SkeletonBase
          className={cn("rounded", className)}
          style={{ width: width ?? "100%", height: height ?? 14 }}
        />
      )
  }
}
