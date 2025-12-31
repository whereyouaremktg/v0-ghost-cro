"use client"

export function SocialProof() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-foreground text-background py-4 px-6 border-3 border-foreground -rotate-1 mb-16">
          <p className="text-center font-bold uppercase tracking-wide text-lg">
            Trusted by 50+ Shopify stores • $2M+ in recovered revenue • 23% avg conversion lift
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { value: "5 min", label: "Analysis time", bg: "bg-card" },
            { value: "23%", label: "Avg. conversion lift", bg: "bg-primary" },
            { value: "$79", label: "One-time cost", bg: "bg-card" },
          ].map((stat, i) => (
            <div
              key={i}
              className={`${stat.bg} border-3 border-foreground p-8 text-center brutal-shadow brutal-hover`}
              style={{ transform: `rotate(${i % 2 === 0 ? "-1" : "1"}deg)` }}
            >
              <div className="text-5xl sm:text-6xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-muted-foreground font-bold uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
