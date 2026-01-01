"use client"

import { useState } from "react"
import { Check, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

const plans = [
  {
    name: "Starter",
    price: "$99",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "price_1Skocm1Ao2BgSmR8bFjwjLdu",
    description: "Perfect for small stores testing the waters",
    features: [
      "5 cart analysis tests per month",
      "AI-powered friction detection",
      "5 shopper persona analysis",
      "Basic recommendations",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$249",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH || "price_1Skocy1Ao2BgSmR8i0dr4wFL",
    description: "For growing stores serious about optimization",
    features: [
      "20 cart analysis tests per month",
      "AI-powered friction detection",
      "5 shopper persona analysis",
      "Advanced recommendations",
      "Priority email support",
      "Shopify integration",
      "Revenue calculator",
    ],
    popular: true,
  },
  {
    name: "Scale",
    price: "$499",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCALE || "price_1SkodI1Ao2BgSmR8trKZM48P",
    description: "For high-volume stores maximizing conversions",
    features: [
      "Unlimited cart analysis tests",
      "AI-powered friction detection",
      "5 shopper persona analysis",
      "Premium recommendations",
      "Priority support + Slack",
      "Shopify integration",
      "Revenue calculator",
      "Custom integrations",
      "Dedicated success manager",
    ],
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleStartTrial = async (priceId: string, planName: string) => {
    setLoading(planName)
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Error creating checkout:", error)
      alert("Failed to start checkout. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b-4 border-border bg-card">
        <div className="container mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold uppercase tracking-tight">Pricing</h1>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold uppercase tracking-tight mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-muted-foreground">
            14-day free trial on all plans. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-card border-2 border-border brutal-shadow p-8 relative ${
                plan.popular ? "border-primary border-4" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary border-2 border-border">
                  <span className="text-xs font-bold uppercase tracking-wide text-primary-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" strokeWidth={3} />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleStartTrial(plan.priceId, plan.name)}
                disabled={loading === plan.name}
                className={`w-full px-6 py-4 font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover ${
                  plan.popular
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.name ? "Loading..." : "Start Free Trial"}
              </button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                14-day trial, then {plan.price}/month
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-bold uppercase tracking-wide text-primary hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
