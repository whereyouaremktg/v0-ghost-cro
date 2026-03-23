import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          {
            "bg-[hsl(var(--accent))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--accent-hover))] shadow-sm hover:shadow-md hover:shadow-[hsl(var(--accent)/0.15)]":
              variant === "default",
            "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-3))] hover:text-[hsl(var(--text-primary))]":
              variant === "secondary",
            "bg-[hsl(var(--critical))] text-white hover:bg-[hsl(var(--critical))]/90":
              variant === "destructive",
            "border border-[hsl(var(--border-default))] bg-transparent text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text-primary))] hover:border-[hsl(var(--border-hover))]":
              variant === "outline",
            "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text-primary))]":
              variant === "ghost",
            "text-[hsl(var(--accent))] underline-offset-4 hover:underline":
              variant === "link",
          },
          {
            "h-10 px-4 text-sm": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-6 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
