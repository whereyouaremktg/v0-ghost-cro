import * as React from "react"

import { cn } from "@/lib/utils"

type GhostCardProps = React.HTMLAttributes<HTMLDivElement>

export function GhostCard({ className, ...props }: GhostCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#2A2A2E] bg-[#141416] text-white shadow-sm",
        className,
      )}
      {...props}
    />
  )
}
