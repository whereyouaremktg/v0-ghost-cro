import { cn } from '@/lib/utils'

interface GhostLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | number
  animated?: boolean
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
}

export function GhostLogo({ className, size = 'md', animated = false }: GhostLogoProps) {
  // Handle numeric size
  if (typeof size === 'number') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(animated && 'ghost-float', className)}
      >
        {/* Ghost body - rounded arch/doorway shape */}
        <path
          d="M20 4C11.163 4 4 11.163 4 20v12c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V20c0-8.837-7.163-16-16-16z"
          fill="currentColor"
          className="text-white"
        />
        {/* Amber eye glow effect (outer) */}
        <circle
          cx="20"
          cy="17"
          r="6"
          className="fill-[#FBBF24] opacity-20"
        />
        {/* Amber eye (inner) */}
        <circle
          cx="20"
          cy="17"
          r="4"
          className="fill-[#FBBF24]"
        />
      </svg>
    )
  }

  // Handle string size
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizes[size], animated && 'ghost-float', className)}
    >
      {/* Ghost body - rounded arch/doorway shape */}
      <path
        d="M20 4C11.163 4 4 11.163 4 20v12c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V20c0-8.837-7.163-16-16-16z"
        fill="currentColor"
        className="text-white"
      />
      {/* Amber eye glow effect (outer) */}
      <circle
        cx="20"
        cy="17"
        r="6"
        className="fill-[#FBBF24] opacity-20"
      />
      {/* Amber eye (inner) */}
      <circle
        cx="20"
        cy="17"
        r="4"
        className="fill-[#FBBF24]"
      />
    </svg>
  )
}
