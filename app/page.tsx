"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Check,
  Activity,
  TrendingUp,
  Users,
  Zap,
  Target,
  Play,
  ExternalLink,
  Clock,
  AlertTriangle
} from "lucide-react"
import { GhostLogo } from "@/components/ui/ghost-logo"

// --- CONSTANTS ---

const GHOST_FEED_MESSAGES = [
  "👻 Ghost #1 analyzing Add to Cart latency...",
  "📈 Benchmark: You are 14% below category average...",
  "⚡ Simulating mobile checkout on iPhone 15...",
  "🔍 Identifying friction at payment gateway...",
  "🛡️ Bot traffic filtered (40% noise removed)...",
  "✅ Verified Apple Pay availability...",
  "📉 Cart abandonment detected at Shipping step...",
  "🚀 Generated fix: Shipping Transparency Module...",
]

const FEATURES = [
  {
    icon: Activity,
    title: "Revenue Leak Detection",
    description: "Ghost monitors your checkout 24/7. When conversion drops, you know instantly—and exactly how much it's costing you.",
    benefit: "Eliminates silent revenue drain",
    colSpan: "md:col-span-2",
  },
  {
    icon: Users,
    title: "Digital Twin Testing",
    description: "5 AI personas (Budget Mom, Impulse Buyer, etc.) test your store like real humans to find friction points.",
    benefit: "Uncovers UX blind spots",
    colSpan: "md:col-span-1",
  },
  {
    icon: Target,
    title: "Dollar-Ranked Fixes",
    description: "Stop guessing. Every optimization is ranked by revenue impact. Tackle the $5k leak before the $50 typo.",
    benefit: "Prioritizes high-impact work",
    colSpan: "md:col-span-1",
  },
  {
    icon: Zap,
    title: "One-Click Optimization",
    description: "Ghost generates production-ready Liquid code. You verify the fix and deploy in seconds to lift conversion.",
    benefit: "Accelerates dev velocity",
    colSpan: "md:col-span-2",
  },
]

const PLANS = [
  {
    name: "Starter",
    price: "$149",
    description: "For stores doing <$50k/mo",
    features: [
      "Weekly checkout simulation",
      "Top 3 CRO recommendations",
      "Basic implementation guides",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$299",
    popular: true,
    description: "For scaling brands ($50k - $500k)",
    features: [
      "Daily active monitoring",
      "Unlimited synthetic testing",
      "One-click Liquid code fixes",
      "Priority CRO support",
      "Competitor benchmarking",
    ],
  },
  {
    name: "Scale",
    price: "$499",
    description: "For high-volume merchants",
    features: [
      "Real-time session analysis",
      "Custom persona definition",
      "Dedicated success manager",
      "API access",
      "Custom integrations",
    ],
  },
]

// --- ANIMATION VARIANTS ---

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-hidden font-sans selection:bg-[#0070F3]/30">

      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-[#0070F3]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#020202]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <GhostLogo size={28} className="group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold tracking-tight">
              Ghost<span className="text-[#0070F3]">CRO</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-[#0070F3] text-white text-sm font-medium rounded-lg hover:bg-[#0070F3]/90 transition-all shadow-[0_0_20px_rgba(0,112,243,0.3)] hover:shadow-[0_0_30px_rgba(0,112,243,0.5)]"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">

        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <motion.div
              className="space-y-8"
              initial="initial"
              animate={mounted ? "animate" : "initial"}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0070F3]/10 border border-[#0070F3]/20 rounded-full text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0070F3] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0070F3]"></span>
                </span>
                <span className="text-zinc-300 font-medium">Early Access — Free during beta</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
              >
                Your checkout is
                <br />
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f87171] to-[#ef4444]">
                    losing $12K/month
                  </span>
                  <motion.span
                    className="absolute inset-0 blur-2xl bg-red-500/20"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-zinc-300 max-w-xl leading-relaxed"
              >
                Ghost finds the leaks. AI personas stress-test your Shopify store,
                identify exactly where revenue is bleeding, and deploy fixes automatically.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0,112,243,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-8 py-4 bg-[#0070F3] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(0,112,243,0.3)]"
                  >
                    Find My Revenue Leaks
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 bg-white/[0.05] border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Play className="w-4 h-4" />
                    See How It Works
                  </button>
                </a>
              </motion.div>

              <motion.div variants={fadeInUp} className="pt-8 flex items-center gap-6 text-zinc-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>No code required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Works with Shopify Plus</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: The Revenue Command Center UI */}
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate={mounted ? "animate" : "initial"}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0070F3]/20 to-purple-500/20 rounded-[2rem] blur-[80px]" />

              {/* THE CARD */}
              <div className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden group">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0F0F0F]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Live Analysis</h3>
                      <p className="text-xs text-zinc-500">Optimizing checkout flow...</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-[#0070F3]/10 text-[#0070F3] text-xs font-bold rounded-full border border-[#0070F3]/20">
                    CRO ENGINE ACTIVE
                  </div>
                </div>

                {/* Hero Content */}
                <div className="p-8">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400 font-medium uppercase tracking-wide">Revenue Opportunity</p>
                      <h2 className="text-4xl font-bold text-white mt-1">$12,450<span className="text-zinc-600">/mo</span></h2>
                      <p className="text-sm text-zinc-500 mt-2">
                        Ghost identified 3 high-impact fixes to lift conversion by ~12%.
                      </p>
                    </div>
                  </div>

                  {/* Priority List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500 font-medium uppercase tracking-wider px-1">
                      <span>Priority Fixes</span>
                      <span>Est. Lift</span>
                    </div>

                    {[
                      { title: "Hidden Shipping Costs", impact: "$3,200/mo", effort: "Low", icon: Zap },
                      { title: "No Express Checkout", impact: "$2,100/mo", effort: "Low", icon: Zap },
                      { title: "Trust Signals Missing", impact: "$1,400/mo", effort: "Medium", icon: Clock },
                    ].map((fix, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.05] rounded-xl hover:bg-white/[0.05] transition-colors group/item">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0070F3]/10 text-[#0070F3]">
                            <fix.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{fix.title}</div>
                            <div className="text-xs text-zinc-500 mt-0.5">{fix.effort} Effort</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-mono text-emerald-400 font-medium">+{fix.impact}</span>
                          <button className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity">
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Scan Line */}
                <div className="h-1 w-full bg-[#0070F3]/20 overflow-hidden">
                  <div className="h-full bg-[#0070F3] w-1/3 animate-[loading_2s_ease-in-out_infinite]" />
                </div>
              </div>

              {/* Floating Element - Personas */}
              <motion.div
                className="absolute -right-6 top-20 bg-[#111] p-4 rounded-xl border border-white/10 shadow-xl max-w-[200px]"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">Simulating User</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-lg">👩‍👧</div>
                  <div>
                    <div className="text-sm font-bold text-white">Budget Mom</div>
                    <div className="text-[10px] text-zinc-400">Mobile • $65k • Price Sensitive</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-red-400 font-medium p-2 bg-red-500/10 rounded-lg">
                  "I abandoned at cart because shipping was $12."
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* --- MARQUEE --- */}
        <div className="border-y border-white/[0.08] bg-[#0a0a0a]/50 backdrop-blur-sm overflow-hidden py-3">
          <div className="flex animate-[marquee_40s_linear_infinite]">
            {[...GHOST_FEED_MESSAGES, ...GHOST_FEED_MESSAGES].map((msg, i) => (
              <div key={i} className="flex items-center gap-3 mx-8 whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity">
                <Activity className="w-4 h-4 text-[#0070F3]" />
                <span className="text-sm font-mono text-zinc-400">{msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- EARLY ACCESS --- */}
        <section className="py-12 px-6 border-b border-white/[0.05]">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-orange-500"].map((bg, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-[#020202] flex items-center justify-center text-xs font-bold`}>
                      {["S", "M", "K", "J"][i]}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-zinc-400">
                  <span className="text-white font-medium">47 merchants</span> on the waitlist
                </span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden md:block" />
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-zinc-400">Built by Shopify founders</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden md:block" />
              <div className="text-sm text-zinc-400">
                <span className="text-[#0070F3] font-medium">Free</span> during beta
              </div>
            </div>
          </div>
        </section>

        {/* --- PROBLEM SECTION --- */}
        <section className="py-24 px-6 bg-[#050505]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Your analytics show traffic.
                <br />
                <span className="text-[#0070F3]">Ghost shows the truth.</span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                40% of your traffic isn't human. Your real conversion rate is hidden under noise.
                Ghost filters the bots and shows exactly where money walks out the door.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  value: "70%",
                  label: "Cart Abandonment",
                  detail: "Industry average—you're probably barely beating it",
                  color: "text-white"
                },
                {
                  value: "$18K",
                  label: "Avg Monthly Leak",
                  detail: "What Ghost users discover in their first scan",
                  color: "text-[#f87171]"
                },
                {
                  value: "48hrs",
                  label: "Time to ROI",
                  detail: "Most merchants recover their first month's cost",
                  color: "text-[#10b981]"
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-[#0A0A0A] rounded-2xl p-8 border border-white/[0.05] hover:border-[#0070F3]/30 transition-all group"
                >
                  <div className={`text-5xl font-mono font-bold mb-2 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-lg font-medium mb-2 text-white">{stat.label}</div>
                  <div className="text-sm text-zinc-500">{stat.detail}</div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">The Silent Killer</h3>
                  <p className="text-zinc-400">
                    Every day you wait, you lose ~$400 in preventable checkout abandonment.
                    Ghost identifies the top 3 revenue leaks in under 5 minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section id="how-it-works" className="py-24 px-6 border-b border-white/[0.05]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">The Intelligence Engine</h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                Ghost replaces guesswork with a 3-step automated optimization system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Connect", desc: "One-click Shopify OAuth. Secure, read-only access. Setup takes 30 seconds.", icon: ExternalLink, isGhost: false },
                { step: "02", title: "Simulate", desc: "Ghost deploys 5 AI personas to browse, cart, and attempt checkout on your site.", icon: null, isGhost: true },
                { step: "03", title: "Optimize", desc: "Get prioritized fixes. Deploy Liquid code updates instantly to lift conversion.", icon: Zap, isGhost: false },
              ].map((item, i) => (
                <div key={i} className="group relative bg-[#0A0A0A] p-8 rounded-2xl border border-white/5 hover:border-[#0070F3]/30 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#0070F3] to-transparent">{item.step}</span>
                  </div>
                  <div className="w-12 h-12 bg-[#0070F3]/10 rounded-xl flex items-center justify-center text-[#0070F3] mb-6 group-hover:scale-110 transition-transform">
                    {item.isGhost ? (
                      <GhostLogo size={24} />
                    ) : (
                      item.icon && <item.icon className="w-6 h-6" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section id="features" className="py-24 px-6 bg-[#050505]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <span className="text-[#0070F3] font-bold tracking-wider uppercase text-sm">Features</span>
              <h2 className="text-4xl font-bold text-white mt-2">Built to drive growth.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map((feature, i) => (
                <div key={i} className={`${feature.colSpan} bg-[#0A0A0A] p-8 rounded-2xl border border-white/5 hover:border-[#0070F3]/30 transition-all group`}>
                  <feature.icon className="w-8 h-8 text-[#0070F3] mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-zinc-400 mb-6 max-w-md">{feature.description}</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wide">
                    <TrendingUp className="w-3 h-3" />
                    {feature.benefit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PRICING --- */}
        <section id="pricing" className="py-24 px-6 border-t border-white/[0.05]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Invest in revenue, not tools.</h2>
              <p className="text-zinc-400">Most merchants recover their subscription cost in the first 48 hours.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan, i) => (
                <div key={i} className={`relative p-8 rounded-2xl border ${plan.popular ? 'bg-[#0070F3]/5 border-[#0070F3]/50' : 'bg-[#0A0A0A] border-white/10'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#0070F3] text-white text-xs font-bold rounded-full">
                      BEST ROI
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2 mb-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-zinc-500">/mo</span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-6">{plan.description}</p>

                  <Link href="/signup">
                    <button className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${plan.popular ? 'bg-[#0070F3] text-white hover:bg-[#0070F3]/90' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                      Start Free Trial
                    </button>
                  </Link>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-[#0070F3] mt-0.5 shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA --- */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#0070F3]/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,112,243,0.15),transparent_70%)]" />

          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Your checkout is leaking
              <br />
              <span className="text-[#0070F3]">right now.</span>
            </h2>
            <p className="text-xl text-zinc-400 mb-10">
              Join 47 merchants already on the waitlist. Setup takes 30 seconds.
              <br />
              <span className="text-emerald-400 font-medium">Free during beta.</span>
            </p>
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-white text-black font-bold rounded-xl text-lg hover:bg-zinc-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                Find My Revenue Leaks
              </motion.button>
            </Link>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/[0.05] bg-[#020202] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <GhostLogo size={24} />
            <span className="font-bold">GhostCRO</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
          <div className="text-sm text-zinc-600">
            © 2025 Ghost CRO Inc.
          </div>
        </div>
      </footer>

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0; }
          50% { width: 100%; margin-left: 0; }
          100% { width: 0%; margin-left: 100%; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
