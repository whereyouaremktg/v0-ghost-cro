import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const ghostButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]/50 cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--landing-accent)] text-[#0A0A0A] hover:bg-[var(--landing-accent-hover)] amber-glow hover:-translate-y-0.5',
        outline:
          'border border-[var(--landing-border)] bg-transparent text-[var(--landing-text-primary)] hover:bg-[var(--landing-surface-hover)] hover:border-[var(--landing-accent)]/30 hover:-translate-y-0.5',
        ghost:
          'text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-surface)]',
      },
      size: {
        sm: 'h-9 px-4 rounded-lg text-sm',
        default: 'h-11 px-6 rounded-xl text-sm',
        lg: 'h-14 px-8 rounded-xl text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

interface GhostButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ghostButtonVariants> {
  asChild?: boolean
}

const GhostButton = React.forwardRef<HTMLButtonElement, GhostButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(ghostButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GhostButton.displayName = 'GhostButton'

export { GhostButton, ghostButtonVariants }
