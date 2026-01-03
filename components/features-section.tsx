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
    <section id="features" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2
            className="text-5xl md:text-6xl font-normal text-gray-900 mb-4"
            style={{ letterSpacing: '-0.03em', lineHeight: '1.05' }}
          >
            Everything you need to stop the bleed.
          </h2>
        </div>

        {/* Bento grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-fr">
          {features.map((feature, index) => {
            const Icon = feature.icon
            // Large cards: indices 0 and 2 (span 2 columns)
            // Small cards: indices 1, 3, 4, 5 (span 1 column)
            const isLarge = index === 0 || index === 2
            const colSpan = isLarge ? "md:col-span-2" : "md:col-span-1"

            return (
              <div
                key={index}
                className={`${colSpan} bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                  isLarge ? "bg-gradient-to-br from-lime-50/50 to-white" : ""
                }`}
              >
                <div
                  className={`${
                    isLarge ? "w-16 h-16" : "w-12 h-12"
                  } rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center mb-6`}
                >
                  <Icon
                    className={`${isLarge ? "h-8 w-8" : "h-6 w-6"} text-lime-600`}
                    strokeWidth={2.5}
                  />
                </div>
                <h3
                  className={`${
                    isLarge ? "text-2xl" : "text-xl"
                  } font-semibold text-gray-900 mb-3`}
                >
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed flex-1">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
