import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "critical" | "warning" | "success" | "info" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-[hsl(var(--accent))] text-[hsl(var(--primary-foreground))]": variant === "default",
          "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-secondary))]": variant === "secondary",
          "bg-[hsl(var(--critical-soft))] text-[hsl(var(--critical))]": variant === "critical",
          "bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))]": variant === "warning",
          "bg-[hsl(var(--success-soft))] text-[hsl(var(--success))]": variant === "success",
          "bg-[hsl(var(--info-soft))] text-[hsl(var(--info))]": variant === "info",
          "border border-[hsl(var(--border-default))] text-[hsl(var(--text-secondary))]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
