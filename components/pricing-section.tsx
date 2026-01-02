"use client"

import { useState } from "react"
import { Check, Zap, TrendingUp, Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for small stores getting started with CRO",
    features: [
      "5 checkout tests per month",
      "AI friction analysis",
      "Basic fix recommendations",
      "Email support",
      "7-day data retention",
    ],
    icon: Zap,
    popular: false,
    priceId: "price_starter", // Replace with real Stripe price ID
  },
  {
    name: "Growth",
    price: "$99",
    period: "/month",
    description: "For growing brands serious about conversion",
    features: [
      "15 checkout tests per month",
      "Advanced AI personas",
      "Priority fix recommendations",
      "Slack integration",
      "30-day data retention",
      "Revenue impact calculator",
    ],
    icon: TrendingUp,
    popular: true,
    priceId: "price_growth", // Replace with real Stripe price ID
  },
  {
    name: "Scale",
    price: "$249",
    period: "/month",
    description: "Unlimited testing for high-volume stores",
    features: [
      "Unlimited checkout tests",
      "Custom AI personas",
      "White-glove onboarding",
      "Dedicated Slack channel",
      "90-day data retention",
      "API access",
      "Custom integrations",
    ],
    icon: Building2,
    popular: false,
    priceId: "price_scale", // Replace with real Stripe price ID
  },
]

export function PricingSection() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId)
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        // If not authenticated, redirect to login
        window.location.href = "/login?redirect=pricing"
      }
    } catch (error) {
      console.error("Checkout error:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <section id="pricing" className="py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary border-3 border-foreground brutal-shadow text-sm font-bold uppercase tracking-wide mb-6">
            Simple Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight mb-4">
            Pick your <span className="bg-primary px-2 -rotate-1 inline-block">plan</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-card border-3 border-foreground p-8 ${
                plan.popular ? "brutal-shadow-primary -translate-y-2" : "brutal-shadow"
              } hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary border-3 border-foreground text-sm font-bold uppercase">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-foreground border-2 border-foreground">
                  <plan.icon className="w-5 h-5 text-background" />
                </div>
                <h3 className="text-2xl font-bold uppercase">{plan.name}</h3>
              </div>

              <div className="mb-4">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground font-medium">{plan.period}</span>
              </div>

              <p className="text-muted-foreground mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="p-1 bg-primary border-2 border-foreground mt-0.5">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loading === plan.priceId}
                className={`w-full border-3 border-foreground font-bold uppercase tracking-wide py-6 ${
                  plan.popular
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
              >
                {loading === plan.priceId ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Free Trial"}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-8">All plans include a 14-day free trial. Cancel anytime.</p>
      </div>
    </section>
  )
}
