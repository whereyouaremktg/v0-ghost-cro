"use client"

import { Component, ReactNode } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import Link from "next/link"
import { GhostLogo } from "@/components/ghost-logo"
import { GhostButton } from "@/components/ui/ghost-button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-full rounded-xl border border-[var(--ghost-border)] bg-[var(--ghost-bg-secondary)] p-8 flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--ghost-border-hover)] bg-[var(--ghost-bg-primary)]">
              <GhostLogo size={28} />
            </div>
            <div className="mx-auto mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-[var(--ghost-text-muted)] mb-1">
              This section crashed while rendering.
            </p>
            <p className="text-xs text-[var(--ghost-text-subtle)] mb-6">
              {this.state.error?.message || "Try again or return to the dashboard."}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <GhostButton
                variant="outline"
                size="sm"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </GhostButton>
              <GhostButton asChild size="sm">
                <Link href="/dashboard">Go to Dashboard</Link>
              </GhostButton>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}



