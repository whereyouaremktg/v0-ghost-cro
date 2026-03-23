import Link from "next/link"
import { Ghost, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--surface-0))] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border-default))]">
        <div className="flex items-center gap-2">
          <Ghost className="h-6 w-6 text-[hsl(var(--accent))]" />
          <span className="font-semibold text-[hsl(var(--text-primary))]">Ghost CRO</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--accent))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--accent-hover))] transition-colors"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))] text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]" />
            AI-Powered CRO for Shopify
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[hsl(var(--text-primary))] leading-[1.1] mb-6">
            Your silent
            <br />
            <span className="text-[hsl(var(--accent))]">CRO engine</span>
            <br />
            for Shopify.
          </h1>

          <p className="text-lg text-[hsl(var(--text-secondary))] mb-10 max-w-xl mx-auto leading-relaxed">
            Ghost scans your store, simulates real buyer personas, and surfaces
            revenue-killing friction with production-ready fixes.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--accent))] px-6 py-3 text-base font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--accent-hover))] shadow-md hover:shadow-lg transition-all"
            >
              Connect Your Store
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
