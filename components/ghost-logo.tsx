import * as React from "react"

import { cn } from "@/lib/utils"

type GhostLogoProps = {
  size?: number
  className?: string
}

export function GhostLogo({ size = 32, className }: GhostLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={cn("text-white", className)}
      aria-hidden="true"
    >
      <path
        d="M12 44c0-13.255 8.954-24 20-24s20 10.745 20 24v8.5c0 3.314-2.686 6-6 6H18c-3.314 0-6-2.686-6-6V44Z"
        stroke="currentColor"
        strokeWidth="3"
        fill="#111111"
      />
      <path
        d="M20 44c0 3.314 2.686 6 6 6s6-2.686 6-6M32 44c0 3.314 2.686 6 6 6s6-2.686 6-6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="6" fill="#FBBF24" />
    </svg>
  )
}
