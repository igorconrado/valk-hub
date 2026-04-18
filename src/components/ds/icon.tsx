import { type LucideProps } from "lucide-react"
import * as LucideIcons from "lucide-react"

interface IconProps extends Omit<LucideProps, "ref"> {
  name: string
  size?: number
  strokeWidth?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const icons = LucideIcons as unknown as Record<string, React.ComponentType<any>>

export function Icon({ name, size = 16, strokeWidth = 1.5, ...props }: IconProps) {
  const pascalName = name
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("")

  const LucideIcon = icons[pascalName]

  if (!LucideIcon) {
    return null
  }

  return <LucideIcon size={size} strokeWidth={strokeWidth} {...props} />
}
