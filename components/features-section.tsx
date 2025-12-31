"use client"

import { Search, BarChart3, Bot } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Friction Analysis",
    description: "Every point where shoppers hesitate, doubt, or abandon—mapped and explained with precision.",
    rotate: "-1deg",
  },
  {
    icon: BarChart3,
    title: "Fix Priorities",
    description: "Ranked by revenue impact. Know exactly what to fix first to maximize your ROI.",
    rotate: "1deg",
  },
  {
    icon: Bot,
    title: "Synthetic Testing",
    description: "AI shoppers with different personas reveal hidden objections real users never tell you.",
    rotate: "-0.5deg",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-5 py-2 bg-primary border-3 border-foreground brutal-shadow mb-6 -rotate-1">
            <span className="font-bold uppercase tracking-wide text-foreground">Powered by AI</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground uppercase mb-4">
            Everything you need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Our AI doesn't just find problems—it tells you exactly how to fix them.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border-3 border-foreground p-8 brutal-shadow brutal-hover"
              style={{ transform: `rotate(${feature.rotate})` }}
            >
              <div className="w-16 h-16 bg-primary border-3 border-foreground flex items-center justify-center mb-6 brutal-shadow">
                <feature.icon className="w-8 h-8 text-foreground" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3 uppercase">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
