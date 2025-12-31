"use client"

import { Link2, Cpu, FileCheck } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Paste your URL",
    description: "Just enter your Shopify store address—no login or access required.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI analyzes",
    description: "Our AI simulates 1,000+ shopping journeys with different personas.",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Get fixes",
    description: "Receive a detailed report with actionable recommendations in minutes.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-muted">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground uppercase mb-4">How it works</h2>
          <p className="text-xl text-muted-foreground font-medium">Three simple steps to uncover hidden revenue</p>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-card border-3 border-foreground p-6 sm:p-8 brutal-shadow brutal-hover flex flex-col sm:flex-row items-start gap-6"
              style={{ transform: `rotate(${index % 2 === 0 ? "-0.5" : "0.5"}deg)` }}
            >
              {/* Big number */}
              <div className="text-7xl sm:text-8xl font-bold text-primary leading-none font-mono">{step.number}</div>

              {/* Icon */}
              <div className="w-16 h-16 bg-primary border-3 border-foreground flex items-center justify-center brutal-shadow shrink-0">
                <step.icon className="w-8 h-8 text-foreground" strokeWidth={2.5} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground uppercase mb-2">{step.title}</h3>
                <p className="text-lg text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
