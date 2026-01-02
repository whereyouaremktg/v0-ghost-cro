"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Check, Loader2, Store, Sparkles } from "lucide-react"
import { PersonaSelector } from "@/components/dashboard/persona-selector"
import { saveTestResult } from "@/lib/client-storage"
import { ConnectShopifyGate } from "@/components/dashboard/connect-shopify-gate"

type TestState = "idle" | "running" | "complete"

interface ProgressStep {
  label: string
  status: "done" | "current" | "pending"
}

interface ShopifyStore {
  shop: string
  accessToken: string
  connectedAt: string
}

export default function RunTestPage() {
  const router = useRouter()
  const [shopifyStore, setShopifyStore] = useState<ShopifyStore | null>(null)
  const [persona, setPersona] = useState("balanced")
  const [comparePrevious, setComparePrevious] = useState(true)
  const [emailOnComplete, setEmailOnComplete] = useState(false)
  const [testState, setTestState] = useState<TestState>("idle")
  const [isCheckingConnection, setIsCheckingConnection] = useState(true)
  const [steps, setSteps] = useState<ProgressStep[]>([
    { label: "Analyzing cart → checkout flow", status: "pending" },
    { label: "Identifying friction points", status: "pending" },
    { label: "Running synthetic shoppers", status: "pending" },
    { label: "Generating recommendations", status: "pending" },
  ])

  // Check for Shopify connection on mount and auto-trigger scan if needed
  useEffect(() => {
    const stored = localStorage.getItem("shopifyStore")
    if (stored) {
      try {
        const store = JSON.parse(stored)
        setShopifyStore(store)
        
        // Auto-trigger scan if coming from OAuth callback
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get("auto") === "true" && testState === "idle") {
          // Auto-submit the form
          setTimeout(() => {
            const form = document.querySelector("form")
            if (form) {
              form.requestSubmit()
            }
          }, 500)
        }
      } catch (error) {
        console.error("Failed to parse shopify store data:", error)
      }
    }
    setIsCheckingConnection(false)
  }, [testState])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopifyStore) return

    setTestState("running")

    // Build store URL from shop name
    const storeUrl = `https://${shopifyStore.shop}`

    // Start progress animation
    const stepTimings = [1000, 2000, 3000, 4500]
    stepTimings.forEach((timing, index) => {
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((step, i) => ({
            ...step,
            status: i < index ? "done" : i === index ? "current" : "pending",
          })),
        )
      }, timing)
    })

    try {
      // Call the analyze API
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: storeUrl,
          personaMix: persona,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `Analysis failed with status ${response.status}`)
      }

      const { result } = await response.json()

      // Save the result to localStorage
      saveTestResult(result)

      // Complete and redirect
      setSteps((prev) => prev.map((step) => ({ ...step, status: "done" as const })))
      setTestState("complete")
      setTimeout(() => {
        router.push(`/dashboard/test/${result.id}`)
      }, 500)
    } catch (error) {
      console.error("Scan failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to scan store: ${errorMessage}\n\nPlease check:\n1. Your ANTHROPIC_API_KEY is set in .env.local\n2. Your internet connection\n3. Try again in a moment`)
      setTestState("idle")
      setSteps([
        { label: "Analyzing cart → checkout flow", status: "pending" },
        { label: "Identifying friction points", status: "pending" },
        { label: "Running synthetic shoppers", status: "pending" },
        { label: "Generating recommendations", status: "pending" },
      ])
    }
  }

  // Show loading state while checking connection
  if (isCheckingConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  // Show connect gate if Shopify is not connected
  if (!shopifyStore) {
    return <ConnectShopifyGate />
  }

  if (testState !== "idle") {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-card border border-border/50 rounded-xl shadow-lg p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 border border-primary/30 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              {testState === "complete" ? "Analysis Complete" : "Analyzing Store..."}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Store className="h-4 w-4" strokeWidth={2.5} />
            <span>{shopifyStore.shop}</span>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div
                  className={`h-6 w-6 flex items-center justify-center border-2 border-border ${
                    step.status === "done" ? "bg-primary" : step.status === "current" ? "bg-chart-5" : "bg-card"
                  }`}
                >
                  {step.status === "done" ? (
                    <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
                  ) : step.status === "current" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                </div>
                <span
                  className={`text-sm ${
                    step.status === "done"
                      ? "text-foreground"
                      : step.status === "current"
                        ? "text-foreground font-bold"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {testState === "running" && (
            <p className="text-xs text-muted-foreground mt-8">Estimated time remaining: ~1 min</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-primary/10 border border-primary/30 rounded-xl">
            <Sparkles className="h-5 w-5 text-primary" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Re-scan Store</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Analyze your Shopify checkout flow with AI shoppers</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card/40 border border-border/30 rounded-lg text-sm">
          <Store className="h-4 w-4 text-primary" strokeWidth={2.5} />
          <span className="font-medium">{shopifyStore.shop}</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-card border border-border/50 rounded-xl shadow-lg p-8 animate-fade-in">
          {/* Store Info */}
          <div className="mb-6 p-4 bg-background/50 border border-border/30 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Store className="h-4 w-4 text-primary" strokeWidth={2.5} />
              <span className="text-sm font-medium">Connected Store</span>
            </div>
            <p className="text-sm text-muted-foreground">{shopifyStore.shop}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Ghost will analyze your entire cart → checkout flow automatically
            </p>
          </div>

          {/* Persona Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium tracking-wide mb-3">Select Persona Mix</label>
            <PersonaSelector selected={persona} onSelect={setPersona} />
          </div>

          {/* Options */}
          <div className="mb-6 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                    className={`h-5 w-5 border border-border/50 flex items-center justify-center rounded-sm ${
                  comparePrevious ? "bg-primary" : "bg-card"
                }`}
                onClick={() => setComparePrevious(!comparePrevious)}
              >
                {comparePrevious && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
              </div>
              <input
                type="checkbox"
                checked={comparePrevious}
                onChange={(e) => setComparePrevious(e.target.checked)}
                className="sr-only"
              />
              <span className="text-sm">Compare to previous scan</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                    className={`h-5 w-5 border border-border/50 flex items-center justify-center rounded-sm ${
                  emailOnComplete ? "bg-primary" : "bg-card"
                }`}
                onClick={() => setEmailOnComplete(!emailOnComplete)}
              >
                {emailOnComplete && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
              </div>
              <input
                type="checkbox"
                checked={emailOnComplete}
                onChange={(e) => setEmailOnComplete(e.target.checked)}
                className="sr-only"
              />
              <span className="text-sm">Email me when complete</span>
            </label>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium tracking-wide rounded-xl accent-glow transition-all duration-300 hover:-translate-y-1 text-sm"
            >
              Re-scan Store
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <p className="text-xs text-muted-foreground mt-3">
              Estimated time: ~2 minutes • Ghost will analyze your entire checkout flow
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
