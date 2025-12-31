"use client"

import { AnalyzeForm } from "./analyze-form"
import { Ghost } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px),
                           repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px)`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-foreground p-3 border-3 border-foreground brutal-shadow-primary">
            <Ghost className="w-8 h-8 text-background" strokeWidth={3} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground uppercase">Ghost CRO</span>
        </div>

        <div className="inline-flex items-center gap-3 px-5 py-3 bg-primary border-3 border-foreground brutal-shadow">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full bg-foreground opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 bg-foreground"></span>
          </span>
          <span className="text-sm font-bold text-foreground uppercase tracking-wide">
            Stop losing sales to checkout friction
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[0.95] uppercase">
          Find what's <span className="bg-primary px-2 inline-block -rotate-1">killing</span> your conversions
        </h1>

        <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          AI analyzes your checkout like{" "}
          <span className="bg-foreground text-background px-2 py-1 font-bold">1,000 real shoppers</span> would. Get
          fixes in 5 minutes, not 5 weeks.
        </p>

        {/* Form */}
        <div className="pt-6">
          <AnalyzeForm />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {["One-time $79", "5 min report", "No subscription"].map((item, i) => (
            <span
              key={i}
              className="px-4 py-2 bg-card border-2 border-foreground text-sm font-bold uppercase tracking-wide"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
