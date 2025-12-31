"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, ArrowRight } from "lucide-react"

export function AnalyzeForm() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const validateUrl = (input: string): boolean => {
    const trimmed = input.trim().toLowerCase()
    return trimmed.includes(".myshopify.com") || trimmed.includes(".com")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!url.trim()) {
      setError("Please enter your store URL")
      return
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid store URL")
      return
    }

    setIsLoading(true)
    console.log("Redirecting to checkout for:", url)

    await new Promise((resolve) => setTimeout(resolve, 1500))
    alert("In production, this redirects to Stripe checkout")
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError("")
            }}
            placeholder="yourstore.myshopify.com"
            className="w-full bg-card px-6 py-5 text-foreground placeholder:text-muted-foreground border-3 border-foreground brutal-shadow text-lg font-medium focus:outline-none focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0_0_var(--border)] transition-all"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-primary-foreground font-bold px-8 py-5 text-lg uppercase tracking-wide border-3 border-foreground brutal-shadow brutal-hover disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Analyze — $79
              <ArrowRight className="w-5 h-5" strokeWidth={3} />
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="text-destructive text-sm mt-4 font-bold uppercase tracking-wide bg-destructive/10 border-2 border-destructive px-4 py-2 inline-block">
          {error}
        </p>
      )}
    </form>
  )
}
