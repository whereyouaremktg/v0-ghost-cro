"use client"

import { Component, ReactNode } from "react"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

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
        <div className="p-8 flex items-center justify-center min-h-screen bg-background">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || "An error occurred while rendering this page."}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Reload Page
              </button>
              <Link
                href="/ghost#timeline"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline block"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Timeline
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}




