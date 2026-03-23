import { Ghost } from "lucide-react"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[hsl(var(--surface-0))] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center py-6 border-b border-[hsl(var(--border-default))]">
        <div className="flex items-center gap-2">
          <Ghost className="h-6 w-6 text-[hsl(var(--accent))]" />
          <span className="font-semibold text-[hsl(var(--text-primary))]">Ghost CRO</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  )
}
