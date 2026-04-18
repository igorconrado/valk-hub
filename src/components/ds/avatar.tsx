"use client"

import { cn } from "@/lib/utils"

export interface AvatarUser {
  name: string
  initials: string
  color: string
  avatar_url?: string | null
}

interface AvatarProps {
  user: AvatarUser
  size?: number
  ring?: boolean
  className?: string
}

export function Avatar({ user, size = 24, ring = false, className }: AvatarProps) {
  const fontSize = Math.max(9, size * 0.38)

  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name}
        className={cn("rounded-full object-cover", className)}
        style={{
          width: size,
          height: size,
          boxShadow: ring ? `0 0 0 2px ${user.color}22` : "none",
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-sans font-medium select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        background: `${user.color}22`,
        color: user.color,
        border: `1px solid ${user.color}33`,
        fontSize,
        lineHeight: 1,
        boxShadow: ring ? `0 0 0 2px ${user.color}22` : "none",
      }}
      title={user.name}
    >
      {user.initials}
    </div>
  )
}
