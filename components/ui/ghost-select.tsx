import * as React from "react"

import { cn } from "@/lib/utils"

export type GhostSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export function GhostSelect({ className, children, ...props }: GhostSelectProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24]/40",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
