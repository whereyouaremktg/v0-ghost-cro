"use client"

import { Activity, Users, Target, Shield, TrendingUp, Wrench } from "lucide-react"

const features = [
  {
    icon: Activity,
    title: "Live Leak Monitoring",
    description: "Real-time tracking of revenue friction across your entire funnel",
  },
  {
    icon: Users,
    title: "Synthetic Buyer Testing",
    description: "AI personas simulate real customer journeys to find drop-off points",
  },
  {
    icon: Target,
    title: "Revenue-Prioritized Fixes",
    description: "Every recommendation ranked by dollar impact, not guesswork",
  },
  {
    icon: Shield,
    title: "Bot Traffic Filtering",
    description: "See your real conversion rate without data center noise",
  },
  {
    icon: TrendingUp,
    title: "Competitive Benchmarks",
    description: "Compare your checkout against top performers in your category",
  },
  {
    icon: Wrench,
    title: "One-Click Implementation",
    description: "Step-by-step guides for every fix, no developers needed",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Everything you need to stop the bleed.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <Icon className="h-6 w-6 text-primary" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
