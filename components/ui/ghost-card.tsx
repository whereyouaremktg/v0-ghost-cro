import * as React from "react"

import { cn } from "@/lib/utils"

type GhostCardProps = React.HTMLAttributes<HTMLDivElement>

export function GhostCard({ className, ...props }: GhostCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#1F1F1F] bg-[#111111] text-white shadow-sm",
        className,
      )}
      {...props}
    />
  )
}
