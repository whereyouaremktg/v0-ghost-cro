interface GhostLogoProps {
  className?: string
  size?: number
  animated?: boolean
}

export function GhostLogo({ className = "", size = 24, animated = false }: GhostLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? "animate-float" : ""} ${className}`}
    >
      {/* Ghost body */}
      <path
        d="M16 2C9.373 2 4 7.373 4 14v12c0 1.1.9 2 2 2 1.1 0 2-.9 2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1.9 2 2 2s2-.9 2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1.9 2 2 2s2-.9 2-2V14c0-6.627-5.373-12-12-12z"
        fill="currentColor"
        className="text-[#0070F3]"
      />

      {/* Left eye */}
      <ellipse
        cx="11"
        cy="13"
        rx="2.5"
        ry="3"
        fill="#020202"
      />

      {/* Right eye */}
      <ellipse
        cx="21"
        cy="13"
        rx="2.5"
        ry="3"
        fill="#020202"
      />

      {/* Eye shine left */}
      <circle
        cx="10"
        cy="12"
        r="1"
        fill="white"
        opacity="0.8"
      />

      {/* Eye shine right */}
      <circle
        cx="20"
        cy="12"
        r="1"
        fill="white"
        opacity="0.8"
      />

      {/* Subtle glow effect */}
      <path
        d="M16 2C9.373 2 4 7.373 4 14v12c0 1.1.9 2 2 2 1.1 0 2-.9 2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1.9 2 2 2s2-.9 2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1.9 2 2 2s2-.9 2-2V14c0-6.627-5.373-12-12-12z"
        fill="url(#ghost-gradient)"
        opacity="0.3"
      />

      <defs>
        <linearGradient id="ghost-gradient" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Alternative minimal/sleek version
export function GhostLogoMinimal({ className = "", size = 24 }: Omit<GhostLogoProps, 'animated'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Clean ghost silhouette */}
      <path
        d="M16 3C10.477 3 6 7.477 6 13v13l3-3 3 3 4-4 4 4 3-3 3 3V13c0-5.523-4.477-10-10-10z"
        fill="currentColor"
        className="text-[#0070F3]"
      />

      {/* Eyes */}
      <circle cx="12" cy="12" r="2" fill="#020202" />
      <circle cx="20" cy="12" r="2" fill="#020202" />

      {/* Eye glints */}
      <circle cx="11.2" cy="11.2" r="0.8" fill="white" opacity="0.9" />
      <circle cx="19.2" cy="11.2" r="0.8" fill="white" opacity="0.9" />
    </svg>
  )
}

// Animated version with hover state
export function GhostLogoAnimated({ className = "", size = 24 }: Omit<GhostLogoProps, 'animated'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform hover:scale-110 ${className}`}
    >
      {/* Ghost body with wavy bottom */}
      <path
        d="M16 2C9.373 2 4 7.373 4 14v10c0 0 1.5 2 3.5 0s3.5 2 5 0 3.5 2 5 0 3.5 2 5 0 3.5 2 3.5 0V14c0-6.627-5.373-12-12-12z"
        fill="currentColor"
        className="text-[#0070F3]"
      >
        <animate
          attributeName="d"
          dur="2s"
          repeatCount="indefinite"
          values="
            M16 2C9.373 2 4 7.373 4 14v10c0 0 1.5 2 3.5 0s3.5 2 5 0 3.5 2 5 0 3.5 2 5 0 3.5 2 3.5 0V14c0-6.627-5.373-12-12-12z;
            M16 2C9.373 2 4 7.373 4 14v10c0 0 1.5-2 3.5 0s3.5-2 5 0 3.5-2 5 0 3.5-2 5 0 3.5-2 3.5 0V14c0-6.627-5.373-12-12-12z;
            M16 2C9.373 2 4 7.373 4 14v10c0 0 1.5 2 3.5 0s3.5 2 5 0 3.5 2 5 0 3.5 2 5 0 3.5 2 3.5 0V14c0-6.627-5.373-12-12-12z
          "
        />
      </path>

      {/* Eyes */}
      <ellipse cx="11" cy="13" rx="2.5" ry="3" fill="#020202" />
      <ellipse cx="21" cy="13" rx="2.5" ry="3" fill="#020202" />

      {/* Eye shines */}
      <circle cx="10" cy="12" r="1" fill="white" opacity="0.8" />
      <circle cx="20" cy="12" r="1" fill="white" opacity="0.8" />

      {/* Highlight */}
      <path
        d="M10 6c3-2 9-2 12 0"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.2"
      />
    </svg>
  )
}
