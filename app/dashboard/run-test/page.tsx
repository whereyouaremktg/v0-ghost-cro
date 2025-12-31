"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { PersonaSelector } from "@/components/dashboard/persona-selector"
import { mockUser } from "@/lib/mock-data"

type TestState = "idle" | "running" | "complete"

interface ProgressStep {
  label: string
  status: "done" | "current" | "pending"
}

export default function RunTestPage() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [persona, setPersona] = useState("balanced")
  const [comparePrevious, setComparePrevious] = useState(true)
  const [emailOnComplete, setEmailOnComplete] = useState(false)
  const [testState, setTestState] = useState<TestState>("idle")
  const [steps, setSteps] = useState<ProgressStep[]>([
    { label: "Capturing checkout flow", status: "pending" },
    { label: "Analyzing elements", status: "pending" },
    { label: "Running synthetic shoppers", status: "pending" },
    { label: "Generating report", status: "pending" },
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setTestState("running")

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
          url,
          personaMix: persona,
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const { result } = await response.json()

      // Save the result
      await fetch("/api/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      })

      // Complete and redirect
      setSteps((prev) => prev.map((step) => ({ ...step, status: "done" as const })))
      setTestState("complete")
      setTimeout(() => {
        router.push(`/dashboard/test/${result.id}`)
      }, 500)
    } catch (error) {
      console.error("Test failed:", error)
      alert("Failed to run test. Please try again.")
      setTestState("idle")
      setSteps([
        { label: "Capturing checkout flow", status: "pending" },
        { label: "Analyzing elements", status: "pending" },
        { label: "Running synthetic shoppers", status: "pending" },
        { label: "Generating report", status: "pending" },
      ])
    }
  }

  if (testState !== "idle") {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-card border-2 border-border brutal-shadow p-8">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-2">
            {testState === "complete" ? "Analysis Complete" : "Analyzing..."}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">{url}</p>

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
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Run Test</h1>
        <p className="text-muted-foreground">Analyze any checkout with synthetic shoppers</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-card border-2 border-border brutal-shadow p-8">
          {/* URL Input */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-wide mb-3">Checkout URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourstore.com/checkout"
              className="w-full px-4 py-3 bg-input border-2 border-border text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <p className="text-xs text-muted-foreground mt-2">Enter the full URL to your checkout page</p>
          </div>

          {/* Persona Selection */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-wide mb-3">Select Persona Mix</label>
            <PersonaSelector selected={persona} onSelect={setPersona} />
          </div>

          {/* Options */}
          <div className="mb-8 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`h-5 w-5 border-2 border-border flex items-center justify-center ${
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
              <span className="text-sm">Compare to previous test</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`h-5 w-5 border-2 border-border flex items-center justify-center ${
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-wide border-2 border-border brutal-shadow brutal-hover text-sm"
            >
              Run Test
              <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </button>
            <p className="text-xs text-muted-foreground mt-3">
              Uses 1 credit • ~2 min • <span className="font-mono">{mockUser.testsRemaining} tests remaining</span>
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
