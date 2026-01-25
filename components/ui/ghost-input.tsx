import * as React from "react"

import { cn } from "@/lib/utils"

export type GhostInputProps = React.InputHTMLAttributes<HTMLInputElement>

export const GhostInput = React.forwardRef<HTMLInputElement, GhostInputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] px-4 text-sm text-white placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24]/40",
        className,
      )}
      {...props}
    />
  ),
)

GhostInput.displayName = "GhostInput"
