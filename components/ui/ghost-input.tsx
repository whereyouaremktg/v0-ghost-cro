import * as React from "react"

import { cn } from "@/lib/utils"

export type GhostInputProps = React.InputHTMLAttributes<HTMLInputElement>

export const GhostInput = React.forwardRef<HTMLInputElement, GhostInputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-[var(--ghost-border)] bg-[var(--ghost-bg-primary)] px-4 text-sm text-white placeholder:text-[var(--ghost-text-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ghost-accent-primary)]/40",
        className,
      )}
      {...props}
    />
  ),
)

GhostInput.displayName = "GhostInput"
