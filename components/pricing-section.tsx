"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    price: "$149",
    period: "/mo",
    description: "Perfect for growing stores",
    revenue: "Up to $500K annual revenue",
    features: [
      "Weekly leak scans",
      "Top 10 prioritized fixes",
      "Email support",
      "Basic benchmarks",
      "7-day free trial",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    price: "$299",
    period: "/mo",
    description: "Most popular for scaling brands",
    revenue: "Up to $2M annual revenue",
    features: [
      "Daily leak monitoring",
      "Unlimited fixes + implementation guides",
      "Synthetic buyer testing",
      "Priority support",
      "Advanced benchmarks",
      "7-day free trial",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Scale",
    price: "$499",
    period: "/mo",
    description: "For high-volume merchants",
    revenue: "Unlimited revenue",
    features: [
      "Real-time monitoring",
      "Custom benchmarks",
      "Dedicated success manager",
      "API access",
      "Custom integrations",
      "7-day free trial",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Start finding leaks today.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Most merchants recover the cost of Ghost in their first week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular
                  ? "border-primary shadow-xl scale-105 relative"
                  : "border-gray-100"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-semibold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{plan.revenue}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="block">
                <Button
                  className={`w-full rounded-full py-6 text-base font-medium transition-all duration-300 hover:scale-[1.02] ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl"
                      : "bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>

              <p className="text-xs text-center text-gray-500 mt-4">
                7-day free trial · No credit card required
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
