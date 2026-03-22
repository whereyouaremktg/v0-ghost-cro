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
        "rounded-xl border border-[#1F1F1F] bg-[var(--ghost-bg-secondary,#111111)] text-white shadow-sm card-shine",
        variant === "elevated" && "bg-[#131313] border-[#242424]",
        variant === "interactive" &&
          "transition-colors duration-200 hover:border-[#FBBF24]/20 hover:bg-[#131313]",
        paddingMap[padding],
        className,
      )}
      {...props}
    />
  )
}
