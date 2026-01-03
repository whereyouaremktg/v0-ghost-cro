"use client"

import { Search, MessageSquare, ListChecks } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Where is money leaking?",
    description:
      "Ghost scans your entire checkout flow and identifies every friction point costing you revenue - from product page to confirmation.",
  },
  {
    icon: MessageSquare,
    title: "Why are they leaving?",
    description:
      "AI-powered buyer simulations reveal the actual reasons customers abandon. Not just 'left at shipping' - but exactly why.",
  },
  {
    icon: ListChecks,
    title: "What should I fix first?",
    description:
      "Fixes ranked by revenue impact. No more guessing which optimization matters most. Always work on the highest-ROI change.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Three questions. Answered continuously.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <Icon className="h-6 w-6 text-primary" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
