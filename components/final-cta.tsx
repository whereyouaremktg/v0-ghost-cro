"use client"
import { Clock, Shield, Zap, Ghost } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="py-24 px-4 bg-foreground text-background">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase leading-[0.95] mb-8">
          Every day you wait,{" "}
          <span className="bg-primary text-foreground px-3 inline-block rotate-1">you're losing sales</span>
        </h2>

        <p className="text-xl sm:text-2xl text-background/70 mb-12 max-w-2xl mx-auto font-medium">
          Join 50+ Shopify stores that have already discovered their hidden conversion killers.
        </p>

        <div className="max-w-2xl mx-auto mb-12">
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="yourstore.myshopify.com"
              className="flex-1 bg-background text-foreground px-6 py-5 border-3 border-background text-lg font-medium focus:outline-none"
            />
            <button
              type="submit"
              className="bg-primary text-foreground font-bold px-8 py-5 text-lg uppercase tracking-wide border-3 border-background hover:bg-primary/90 transition-colors flex items-center justify-center gap-3"
            >
              Analyze — $79
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
          {[
            { icon: Clock, text: "5 minute analysis" },
            { icon: Shield, text: "100% money-back" },
            { icon: Zap, text: "No access needed" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-background/10 border-2 border-background/30">
              <item.icon className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-sm font-bold uppercase tracking-wide">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t-3 border-background/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Ghost className="w-5 h-5" strokeWidth={3} />
            <span className="font-bold uppercase tracking-wide">Ghost CRO</span>
          </div>
          <p className="text-sm text-background/60 font-medium">
            © {new Date().getFullYear()} Ghost CRO. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  )
}
