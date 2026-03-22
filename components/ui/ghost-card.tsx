import * as React from "react"

import { cn } from "@/lib/utils"

type GhostCardVariant = "default" | "elevated" | "interactive"
type GhostCardPadding = "none" | "sm" | "md" | "lg"

type GhostCardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: GhostCardVariant
  padding?: GhostCardPadding
}

const paddingMap: Record<GhostCardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
}

export function GhostCard({
  className,
  variant = "default",
  padding = "none",
  ...props
}: GhostCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--ghost-border)] bg-[var(--ghost-bg-secondary)] text-white shadow-sm card-shine",
        variant === "elevated" && "bg-[var(--ghost-bg-elevated)] border-[var(--ghost-border-hover)]",
        variant === "interactive" &&
          "transition-colors duration-200 hover:border-[var(--ghost-accent-primary)]/20 hover:bg-[var(--ghost-bg-elevated)]",
        paddingMap[padding],
        className,
      )}
      {...props}
    />
  )
}
