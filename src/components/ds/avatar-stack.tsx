"use client"

import { Avatar, type AvatarUser } from "./avatar"

interface AvatarStackProps {
  users: AvatarUser[]
  max?: number
  size?: number
}

export function AvatarStack({ users, max = 4, size = 22 }: AvatarStackProps) {
  const shown = users.slice(0, max)
  const extra = users.length - shown.length

  return (
    <div className="inline-flex items-center">
      {shown.map((user, i) => (
        <div
          key={user.name + i}
          style={{
            marginLeft: i === 0 ? 0 : -6,
            zIndex: 10 - i,
            outline: "2px solid var(--bg-1)",
            borderRadius: "50%",
          }}
        >
          <Avatar user={user} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className="inline-flex items-center justify-center rounded-full font-sans"
          style={{
            marginLeft: -6,
            zIndex: 0,
            width: size,
            height: size,
            background: "var(--bg-elev)",
            color: "var(--text-secondary)",
            fontSize: size * 0.38,
            fontWeight: 500,
            outline: "2px solid var(--bg-1)",
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}
