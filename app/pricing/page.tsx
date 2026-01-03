"use client"

import { useState, useEffect } from "react"
import { Check, Zap, Store, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const plans = [
  {
    name: "Starter",
    price: "$49",
    planKey: "starter",
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
    price: "$99",
    planKey: "growth",
    description: "For growing stores serious about optimization",
    features: [
      "15 cart analysis tests per month",
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
    price: "$150",
    planKey: "scale",
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

interface ShopifyStore {
  shop: string
  accessToken: string
  connectedAt: string
}

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [shopifyStore, setShopifyStore] = useState<ShopifyStore | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load Shopify credentials from localStorage
    const stored = localStorage.getItem("shopifyStore")
    if (stored) {
      try {
        setShopifyStore(JSON.parse(stored))
      } catch (err) {
        console.error("Failed to parse shopify store data:", err)
      }
    }

    // Check for URL params (canceled, error)
    const params = new URLSearchParams(window.location.search)
    if (params.get("canceled") === "true") {
      setError("Subscription was canceled. You can try again when ready.")
    } else if (params.get("error")) {
      setError(`Something went wrong: ${params.get("error")}`)
    }
  }, [])

  const handleStartTrial = async (planKey: string, planName: string) => {
    // Clear any previous error
    setError(null)

    // Check if Shopify is connected
    if (!shopifyStore) {
      setError("Please connect your Shopify store first to start a subscription.")
      return
    }

    setLoading(planName)
    try {
      const response = await fetch("/api/shopify/billing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planKey,
          shop: shopifyStore.shop,
          accessToken: shopifyStore.accessToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription")
      }

      // Redirect to Shopify for charge approval
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl
      } else {
        throw new Error("No confirmation URL received")
      }
    } catch (err) {
      console.error("Error creating subscription:", err)
      setError(err instanceof Error ? err.message : "Failed to start subscription. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const handleConnectShopify = () => {
    router.push("/ghost")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b-4 border-border bg-card">
        <div className="container mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold uppercase tracking-tight">Pricing</h1>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="container mx-auto px-8 pt-8">
          <div className="bg-destructive/10 border-2 border-destructive text-destructive px-4 py-3 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-sm font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Shopify Connection Status */}
      {!shopifyStore && (
        <div className="container mx-auto px-8 pt-8">
          <div className="bg-muted/50 border-2 border-border p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Store className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-bold">Connect Your Shopify Store</p>
                <p className="text-sm text-muted-foreground">
                  Connect your store to start your free trial
                </p>
              </div>
            </div>
            <button
              onClick={handleConnectShopify}
              className="px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover"
            >
              Connect Store
            </button>
          </div>
        </div>
      )}

      {/* Connected Store Badge */}
      {shopifyStore && (
        <div className="container mx-auto px-8 pt-8">
          <div className="bg-green-500/10 border-2 border-green-500 px-4 py-3 flex items-center gap-3">
            <Check className="h-5 w-5 text-green-500" />
            <p className="text-sm">
              <span className="font-bold">Connected:</span>{" "}
              {shopifyStore.shop.replace(".myshopify.com", "")}
            </p>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="container mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold uppercase tracking-tight mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-muted-foreground">
            7-day free trial on all plans. Billed through Shopify.
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
                onClick={() => handleStartTrial(plan.planKey, plan.name)}
                disabled={loading === plan.name || !shopifyStore}
                className={`w-full px-6 py-4 font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover ${
                  plan.popular
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.name ? "Loading..." : "Start Free Trial"}
              </button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                7-day trial, then {plan.price}/month
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include a 7-day free trial. Cancel anytime through your Shopify admin.
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
