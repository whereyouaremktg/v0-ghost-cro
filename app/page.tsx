import Link from "next/link"
import { ArrowRight, Check, Zap, Target, Shield, TrendingUp, Users, Wrench } from "lucide-react"

export default function Home() {
  return (
    <>
      <div className="grain-overlay" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b-3 border-foreground">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight">
            GHOST<span className="text-primary">CRO</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
            >
              Pricing
            </a>
          </nav>
          <Link href="/login">
            <button className="brutal-btn bg-primary px-6 py-3 text-sm">Login</button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-bold uppercase tracking-wide">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Now with Synthetic Buyer Testing
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight">
                  STOP THE
                  <br />
                  <span className="text-primary">REVENUE BLEED</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Ghost finds where your Shopify checkout is bleeding money—and shows you exactly how to stop it. No
                  more guessing.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup">
                    <button className="brutal-btn bg-primary px-8 py-4 text-base flex items-center gap-2 w-full sm:w-auto justify-center">
                      Find My Leaks
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                  <a href="#how-it-works">
                    <button className="brutal-btn bg-background px-8 py-4 text-base w-full sm:w-auto">
                      See How It Works
                    </button>
                  </a>
                </div>

                {/* Social Proof */}
                <div className="pt-8 border-t-3 border-foreground">
                  <div className="flex flex-wrap gap-6 text-sm font-bold uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary" />
                      <span>150+ Shopify Stores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary" />
                      <span>$2.4M+ Leaks Found</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Dashboard Preview */}
              <div className="relative">
                <div className="sticker top-0 right-0 md:top-4 md:-right-4">
                  6 Critical
                  <br />
                  Issues Found
                </div>

                <div className="brutal-card bg-card p-6 space-y-4 rotate-1">
                  {/* Header */}
                  <div className="flex items-center gap-2 pb-4 border-b-2 border-foreground">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <div className="w-3 h-3 rounded-full bg-success" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground ml-2">ghostcro.app/dashboard</span>
                  </div>

                  {/* Score Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="brutal-border bg-background p-4">
                      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                        Ghost Score
                      </div>
                      <div className="text-4xl font-black">
                        23<span className="text-muted-foreground">/100</span>
                      </div>
                      <div className="mt-2 h-3 bg-muted border-2 border-foreground">
                        <div className="h-full w-[23%] bg-destructive" />
                      </div>
                    </div>
                    <div className="brutal-border bg-primary/20 p-4">
                      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                        Opportunity
                      </div>
                      <div className="text-2xl font-black">$8,200 - $12,400</div>
                      <div className="text-xs text-muted-foreground">per month</div>
                    </div>
                  </div>

                  {/* Threat Cards */}
                  <div className="space-y-3">
                    <div className="brutal-border bg-destructive/10 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-destructive" />
                        <div>
                          <div className="font-bold">Shipping Shock</div>
                          <div className="text-sm text-muted-foreground">Hidden costs at checkout</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-destructive">$3,200</div>
                        <div className="text-xs text-muted-foreground">/month</div>
                      </div>
                    </div>
                    <div className="brutal-border bg-destructive/10 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-destructive" />
                        <div>
                          <div className="font-bold">No Trust Signals</div>
                          <div className="text-sm text-muted-foreground">Missing reviews & badges</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-destructive">$2,800</div>
                        <div className="text-xs text-muted-foreground">/month</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="floating-tag hidden md:block" style={{ bottom: "20%", left: "-5%" }}>
                  #REVENUE
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="bg-foreground text-background py-4 border-y-3 border-foreground overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex">
            <span className="mx-8 text-sm font-black uppercase tracking-widest">
              ★ FIND REVENUE LEAKS ★ AI-POWERED ANALYSIS ★ SHOPIFY OPTIMIZED ★ FIX CHECKOUT FRICTION ★ BOOST CONVERSIONS
              ★ FIND REVENUE LEAKS ★ AI-POWERED ANALYSIS ★ SHOPIFY OPTIMIZED ★ FIX CHECKOUT FRICTION ★ BOOST CONVERSIONS
            </span>
            <span className="mx-8 text-sm font-black uppercase tracking-widest">
              ★ FIND REVENUE LEAKS ★ AI-POWERED ANALYSIS ★ SHOPIFY OPTIMIZED ★ FIX CHECKOUT FRICTION ★ BOOST CONVERSIONS
              ★ FIND REVENUE LEAKS ★ AI-POWERED ANALYSIS ★ SHOPIFY OPTIMIZED ★ FIX CHECKOUT FRICTION ★ BOOST CONVERSIONS
            </span>
          </div>
        </div>

        {/* Problem Section */}
        <section className="py-24 px-6 bg-foreground text-background">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
              YOUR CHECKOUT IS <span className="text-primary">LEAKING MONEY.</span>
              <br />
              YOU JUST CAN'T SEE IT.
            </h2>
            <p className="text-lg md:text-xl text-background/70 max-w-2xl mx-auto leading-relaxed">
              Traditional analytics show you what happened. Ghost shows you why buyers abandoned—and exactly what to
              fix, ranked by revenue impact.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <div className="brutal-border border-background bg-background text-foreground p-6 -rotate-1">
                <div className="text-5xl font-black text-destructive mb-2">70%</div>
                <div className="text-sm font-bold uppercase tracking-wide">Cart Abandonment Rate</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Industry average you&apos;re probably beating... barely
                </div>
              </div>
              <div className="brutal-border border-background bg-background text-foreground p-6 rotate-1">
                <div className="text-5xl font-black text-primary mb-2">$18K</div>
                <div className="text-sm font-bold uppercase tracking-wide">Avg Monthly Leakage</div>
                <div className="text-xs text-muted-foreground mt-2">What Ghost users find in their first scan</div>
              </div>
              <div className="brutal-border border-background bg-background text-foreground p-6 -rotate-1">
                <div className="text-5xl font-black text-secondary mb-2">3.2x</div>
                <div className="text-sm font-bold uppercase tracking-wide">ROI in 30 Days</div>
                <div className="text-xs text-muted-foreground mt-2">Average return from fixing top 3 leaks</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">HOW GHOST WORKS</h2>
              <p className="text-lg text-muted-foreground">Three steps. Zero guesswork. Maximum revenue.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="brutal-card bg-card p-8">
                <div className="w-16 h-16 brutal-border bg-primary flex items-center justify-center mb-6">
                  <span className="text-3xl font-black">1</span>
                </div>
                <h3 className="text-2xl font-black mb-4">CONNECT SHOPIFY</h3>
                <p className="text-muted-foreground">
                  One-click OAuth connection. We pull your checkout data securely—no code, no developers needed.
                </p>
              </div>
              <div className="brutal-card bg-card p-8">
                <div className="w-16 h-16 brutal-border bg-secondary flex items-center justify-center mb-6 text-background">
                  <span className="text-3xl font-black">2</span>
                </div>
                <h3 className="text-2xl font-black mb-4">AI ANALYZES</h3>
                <p className="text-muted-foreground">
                  Synthetic buyers test your checkout. Our AI identifies friction points and calculates revenue impact.
                </p>
              </div>
              <div className="brutal-card bg-card p-8">
                <div className="w-16 h-16 brutal-border bg-foreground flex items-center justify-center mb-6 text-background">
                  <span className="text-3xl font-black">3</span>
                </div>
                <h3 className="text-2xl font-black mb-4">FIX & PROFIT</h3>
                <p className="text-muted-foreground">
                  Get a prioritized fix list ranked by dollar impact. Implementation guides included—no guessing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 bg-muted">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">STOP THE BLEED.</h2>
              <p className="text-lg text-muted-foreground">Everything you need to plug your revenue leaks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Live Leak Monitoring",
                  desc: "Real-time tracking of revenue friction across your entire funnel",
                },
                {
                  icon: Users,
                  title: "Synthetic Buyer Testing",
                  desc: "AI personas simulate real customer journeys to find drop-off points",
                },
                {
                  icon: Target,
                  title: "Revenue-Prioritized Fixes",
                  desc: "Every recommendation ranked by dollar impact, not guesswork",
                },
                {
                  icon: Shield,
                  title: "Bot Traffic Filtering",
                  desc: "See your real conversion rate without data center noise",
                },
                {
                  icon: TrendingUp,
                  title: "Competitive Benchmarks",
                  desc: "Compare your checkout against top performers in your category",
                },
                {
                  icon: Wrench,
                  title: "One-Click Implementation",
                  desc: "Step-by-step guides for every fix, no developers needed",
                },
              ].map((feature, i) => (
                <div key={i} className="brutal-card bg-card p-6 hover:bg-primary/10 transition-colors">
                  <div className="w-12 h-12 brutal-border bg-primary/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">SIMPLE PRICING.</h2>
              <p className="text-lg text-muted-foreground">Most merchants recover Ghost&apos;s cost in week one.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: "Starter",
                  price: "$149",
                  features: ["Weekly leak scans", "Top 10 prioritized fixes", "Email support", "Basic benchmarks"],
                },
                {
                  name: "Growth",
                  price: "$299",
                  popular: true,
                  features: [
                    "Daily monitoring",
                    "Unlimited fixes",
                    "Synthetic buyer testing",
                    "Priority support",
                    "Advanced benchmarks",
                  ],
                },
                {
                  name: "Scale",
                  price: "$499",
                  features: [
                    "Real-time monitoring",
                    "Custom benchmarks",
                    "Dedicated manager",
                    "API access",
                    "Custom integrations",
                  ],
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`brutal-card bg-card p-8 ${plan.popular ? "border-primary bg-primary/5 scale-105 relative" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 text-xs font-black uppercase tracking-wide brutal-border">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                  <div className="text-5xl font-black mb-6">
                    {plan.price}
                    <span className="text-lg text-muted-foreground">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 bg-primary/20 brutal-border flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="block">
                    <button className={`brutal-btn w-full py-4 ${plan.popular ? "bg-primary" : "bg-background"}`}>
                      Start Free Trial
                    </button>
                  </Link>
                  <p className="text-xs text-center text-muted-foreground mt-4">7-day trial • No credit card</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 bg-foreground text-background">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              READY TO STOP
              <br />
              <span className="text-primary">LOSING MONEY?</span>
            </h2>
            <p className="text-lg text-background/70 mb-8 max-w-xl mx-auto">
              Join 150+ Shopify merchants who&apos;ve found and fixed their revenue leaks with Ghost.
            </p>
            <Link href="/signup">
              <button className="brutal-btn bg-primary text-foreground px-12 py-5 text-lg">
                Find My Revenue Leaks
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t-3 border-foreground py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="text-2xl font-black mb-4">
              GHOST<span className="text-primary">CRO</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered checkout analysis for Shopify stores. Find leaks. Fix friction. Make money.
            </p>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-wide mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Changelog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-wide mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-wide mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t-2 border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <span>© 2025 GhostCRO. All rights reserved.</span>
          <span>Built for Shopify merchants who hate leaving money on the table.</span>
        </div>
      </footer>
    </>
  )
}
