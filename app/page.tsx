"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowRight, 
  Check, 
  Ghost, 
  Activity, 
  Shield, 
  TrendingUp, 
  Users, 
  Zap, 
  Target,
  ChevronRight,
  Play,
  ExternalLink,
  AlertTriangle,
  Truck,
  CreditCard,
  Star,
} from "lucide-react"

// Ghost Feed Messages for the marquee
const GHOST_FEED_MESSAGES = [
  "👻 Ghost #1 is analyzing your shipping policy...",
  "🔍 Scanning checkout flow for friction points...",
  "⚠️ High-risk drop-off detected at 'Cart Review'",
  "💰 Potential recovery: $2,400/mo identified",
  "🛡️ Trust signal gap found on product page",
  "⚡ Ghost #3 simulating mobile checkout...",
  "📊 Conversion rate benchmark: You're 23% below category average",
  "🚨 CRITICAL: Hidden shipping costs causing 34% abandonment",
  "✅ Payment options look good - Apple Pay detected",
  "👀 Ghost #5 testing guest checkout flow...",
]

// Features data with profit-protection framing
const FEATURES = [
  {
    icon: Activity,
    title: "Real-Time Leak Detection",
    description: "Every minute your checkout bleeds money. Ghost monitors 24/7 and alerts you the moment a new friction point appears.",
    protection: "Protects against silent revenue drain",
  },
  {
    icon: Users,
    title: "Synthetic Buyer Intelligence",
    description: "5 AI personas test your checkout like real customers. They find what analytics can't see—the why behind abandonment.",
    protection: "Protects against invisible conversion killers",
  },
  {
    icon: Target,
    title: "Dollar-Ranked Fixes",
    description: "Stop guessing what to fix first. Every recommendation shows exact revenue impact so you tackle the biggest leaks first.",
    protection: "Protects your time investment",
  },
  {
    icon: Shield,
    title: "Bot Traffic Shield",
    description: "40% of your traffic isn't human. Ghost filters the noise so you see your real conversion rate—not the inflated lie.",
    protection: "Protects against false metrics",
  },
  {
    icon: TrendingUp,
    title: "Category Benchmarks",
    description: "Know exactly where you stand vs. top performers. Ghost shows the gap between your checkout and category leaders.",
    protection: "Protects against complacency",
  },
  {
    icon: Zap,
    title: "One-Click Deploy",
    description: "No developers needed. Ghost generates ready-to-use Liquid fixes you can inject directly into your Shopify theme.",
    protection: "Protects against implementation delays",
  },
]

// Pricing plans
const PLANS = [
  {
    name: "Starter",
    price: "$149",
    description: "For stores testing the waters",
    features: [
      "Weekly leak scans",
      "Top 10 prioritized fixes",
      "Email support",
      "Basic benchmarks",
    ],
  },
  {
    name: "Growth",
    price: "$299",
    popular: true,
    description: "Most popular for scaling brands",
    features: [
      "Daily leak monitoring",
      "Unlimited fixes + implementation",
      "Synthetic buyer testing",
      "Priority support",
      "Advanced benchmarks",
    ],
  },
  {
    name: "Scale",
    price: "$499",
    description: "For high-volume merchants",
    features: [
      "Real-time monitoring",
      "Custom benchmarks",
      "Dedicated success manager",
      "API access",
      "Custom integrations",
    ],
  },
]

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } }
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [activeGhostLog, setActiveGhostLog] = useState(0)
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    
    // Rotate ghost feed messages
    const interval = setInterval(() => {
      setActiveGhostLog((prev) => (prev + 1) % GHOST_FEED_MESSAGES.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,112,243,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,112,243,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-[#0070F3]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#10b981]/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#020202]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Ghost className="w-6 h-6 text-[#0070F3]" />
            <span className="text-lg font-semibold tracking-tight">
              Ghost<span className="text-[#0070F3]">CRO</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Pricing
            </a>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link 
              href="/signup"
              className="px-4 py-2 bg-[#0070F3] text-white text-sm font-medium rounded-lg hover:bg-[#0070F3]/90 transition-all hover:shadow-[0_0_20px_rgba(0,112,243,0.3)]"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20">
          <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              className="space-y-8"
              initial="initial"
              animate={mounted ? "animate" : "initial"}
              variants={staggerContainer}
            >
              {/* Status Badge */}
              <motion.div 
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] border border-white/[0.08] rounded-full text-sm"
              >
                <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
                <span className="text-zinc-400">Protecting 150+ Shopify stores</span>
              </motion.div>

              {/* Headline - Loss Aversion */}
              <motion.h1 
                variants={fadeInUp}
                className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1]"
              >
                Stop the{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#0070F3] to-[#0070F3]/70">
                    $12,000/mo
                  </span>
                  <motion.span 
                    className="absolute inset-0 blur-2xl bg-[#0070F3]/30"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </span>
                {" "}leak in your Shopify checkout.
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-lg text-zinc-400 max-w-xl leading-relaxed"
              >
                Your checkout is bleeding money right now. Ghost finds exactly where—and shows you how to stop it. 
                No guessing. No generic advice. Just prioritized fixes ranked by dollar impact.
              </motion.p>

              {/* CTAs */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link href="/signup">
                  <motion.button 
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,112,243,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="group px-8 py-4 bg-[#0070F3] text-white font-medium rounded-xl flex items-center gap-2 transition-colors"
                  >
                    Find My Revenue Leaks
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <a href="#how-it-works">
                  <button className="px-8 py-4 text-zinc-400 hover:text-white font-medium flex items-center gap-2 transition-colors">
                    <Play className="w-4 h-4" />
                    Watch Demo
                  </button>
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div 
                variants={fadeInUp}
                className="pt-8 border-t border-white/[0.08] grid grid-cols-3 gap-8"
              >
                <div>
                  <div className="text-3xl font-mono font-semibold text-[#0070F3]">$2.4M+</div>
                  <div className="text-sm text-zinc-500">Leaks identified</div>
                </div>
                <div>
                  <div className="text-3xl font-mono font-semibold text-[#10b981]">23%</div>
                  <div className="text-sm text-zinc-500">Avg. CR increase</div>
                </div>
                <div>
                  <div className="text-3xl font-mono font-semibold text-white">3.2x</div>
                  <div className="text-sm text-zinc-500">ROI in 30 days</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Ghost OS Preview */}
            <motion.div 
              className="relative"
              variants={scaleIn}
              initial="initial"
              animate={mounted ? "animate" : "initial"}
            >
              {/* Glow behind preview */}
              <motion.div 
                className="absolute inset-0 bg-[#0070F3]/20 rounded-3xl blur-[100px]"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Three-pane Dashboard Preview */}
              <div className="relative bg-[#0a0a0a] rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#111] border-b border-white/[0.05]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-[#1a1a1a] rounded px-3 py-1 text-xs text-zinc-500 text-center font-mono">
                      ghostcro.app/ghost
                    </div>
                  </div>
                </div>

                {/* Three Pane Layout */}
                <div className="flex h-[400px]">
                  {/* Left - Ghost Stream */}
                  <div className="w-1/4 border-r border-white/[0.05] p-3 overflow-hidden">
                    <div className="text-[10px] text-zinc-500 mb-2 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-[#0070F3]" />
                      GHOST STREAM
                    </div>
                    <div className="space-y-2 font-mono text-[10px]">
                      {GHOST_FEED_MESSAGES.slice(0, 6).map((msg, i) => (
                        <div 
                          key={i} 
                          className={`p-2 rounded border-l-2 transition-all ${
                            i === activeGhostLog % 6
                              ? "bg-[#0070F3]/10 border-l-[#0070F3] text-[#0070F3]"
                              : "bg-white/[0.02] border-l-zinc-700 text-zinc-500"
                          }`}
                        >
                          {msg}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center - Simulation Deck */}
                  <div className="w-1/2 p-4 overflow-hidden">
                    <div className="text-[10px] text-zinc-500 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Ghost className="w-3 h-3 text-[#0070F3]" />
                        SIMULATION DECK
                      </span>
                      <span className="px-2 py-0.5 bg-[#10b981]/20 text-[#10b981] rounded text-[9px]">LIVE</span>
                    </div>
                    
                    {/* Score */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-[#111] rounded-lg p-3 border border-white/[0.05]">
                        <div className="text-[10px] text-zinc-500 mb-1">Ghost Score</div>
                        <div className="text-2xl font-mono font-bold text-[#f87171]">23</div>
                      </div>
                      <div className="bg-[#0070F3]/10 rounded-lg p-3 border border-[#0070F3]/20">
                        <div className="text-[10px] text-zinc-500 mb-1">Opportunity</div>
                        <div className="text-lg font-mono font-bold text-[#0070F3]">$12,400</div>
                      </div>
                    </div>

                    {/* Persona Verdicts */}
                    <div className="flex gap-2 mb-3">
                      {["👨‍👩‍👧", "⚡", "🔍", "💼", "🆕"].map((emoji, i) => (
                        <div 
                          key={i}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            i < 2 ? "bg-[#10b981]/20 ring-1 ring-[#10b981]/30" : "bg-[#f87171]/20 ring-1 ring-[#f87171]/30"
                          }`}
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>

                    {/* Threat Preview */}
                    <div className="space-y-2">
                      <div className="bg-[#f87171]/10 rounded-lg p-2 border border-[#f87171]/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="w-3 h-3 text-[#f87171]" />
                          <span className="text-[10px] text-white">Shipping Shock</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#f87171]">$3,200/mo</span>
                      </div>
                      <div className="bg-[#fbbf24]/10 rounded-lg p-2 border border-[#fbbf24]/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="w-3 h-3 text-[#fbbf24]" />
                          <span className="text-[10px] text-white">No Trust Signals</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#fbbf24]">$2,800/mo</span>
                      </div>
                    </div>
                  </div>

                  {/* Right - Recovery Queue */}
                  <div className="w-1/4 border-l border-white/[0.05] p-3">
                    <div className="text-[10px] text-zinc-500 mb-2 flex items-center gap-1">
                      <Target className="w-3 h-3 text-[#0070F3]" />
                      RECOVERY QUEUE
                    </div>
                    
                    {/* Revenue Leak */}
                    <div className="bg-gradient-to-br from-[#f87171]/10 to-transparent rounded-lg p-3 border border-[#f87171]/20 mb-3">
                      <div className="text-[9px] text-zinc-500">MONTHLY LEAK</div>
                      <div className="text-xl font-mono font-bold text-[#f87171]">$8,400</div>
                    </div>

                    {/* Fix Cards */}
                    <div className="space-y-2">
                      {[
                        { label: "Add shipping preview", effort: "Low" },
                        { label: "Trust badges", effort: "Low" },
                      ].map((fix, i) => (
                        <div key={i} className="bg-[#111] rounded-lg p-2 border border-white/[0.05]">
                          <div className="text-[10px] text-white mb-1">{fix.label}</div>
                          <button className="w-full py-1 bg-[#0070F3] text-[9px] font-medium rounded text-white">
                            Deploy Fix
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0070F3]/5 via-transparent to-transparent h-[200%] animate-[scan_4s_linear_infinite]" />
                </div>
              </div>

              {/* Floating badges */}
              <motion.div 
                className="absolute -top-4 -right-4 px-3 py-1.5 bg-[#f87171] text-white text-xs font-medium rounded-full shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                6 Critical Issues
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Ghost Feed Marquee */}
        <div className="relative border-y border-white/[0.08] bg-[#0a0a0a]/50 backdrop-blur-sm overflow-hidden py-4">
          <div className="flex animate-[marquee_30s_linear_infinite]">
            {[...GHOST_FEED_MESSAGES, ...GHOST_FEED_MESSAGES].map((msg, i) => (
              <div key={i} className="flex items-center gap-8 mx-8 whitespace-nowrap">
                <span className="text-sm font-mono text-zinc-500">{msg}</span>
                <span className="w-1 h-1 bg-[#0070F3] rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Problem Section */}
        <section className="py-24 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight">
                Your analytics show traffic.
                <br />
                <span className="text-[#0070F3]">Ghost shows truth.</span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                40% of your traffic isn't real customers. Your conversion rate is a lie. 
                Ghost filters the noise and shows you exactly where real money is being lost.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { value: "70%", label: "Cart Abandonment", detail: "Industry average you're probably barely beating" },
                { value: "$18K", label: "Avg Monthly Leak", detail: "What Ghost users find in their first scan", color: "text-[#f87171]" },
                { value: "3.2x", label: "ROI in 30 Days", detail: "Average return from fixing top 3 leaks", color: "text-[#10b981]" },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="bg-[#0a0a0a] rounded-2xl p-8 border border-white/[0.05] hover:border-[#0070F3]/30 transition-all group"
                >
                  <div className={`text-5xl font-mono font-bold mb-2 ${stat.color || "text-white"}`}>
                    {stat.value}
                  </div>
                  <div className="text-lg font-medium mb-2">{stat.label}</div>
                  <div className="text-sm text-zinc-500">{stat.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6 border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
                Three steps to plug the leak.
              </h2>
              <p className="text-lg text-zinc-400">Zero guesswork. Maximum revenue recovery.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Connect Shopify",
                  description: "One-click OAuth. We pull your checkout data securely—no code, no developers.",
                  icon: ExternalLink,
                },
                {
                  step: "02", 
                  title: "Ghost Analyzes",
                  description: "5 synthetic buyers test your checkout. AI identifies friction and calculates revenue impact.",
                  icon: Ghost,
                },
                {
                  step: "03",
                  title: "Deploy & Profit",
                  description: "Get prioritized fixes ranked by dollar impact. One-click deploy to your theme.",
                  icon: Zap,
                },
              ].map((item, i) => (
                <div key={i} className="relative group">
                  <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-white/[0.05] hover:border-[#0070F3]/30 transition-all h-full">
                    <div className="w-12 h-12 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/20 flex items-center justify-center mb-6">
                      <item.icon className="w-6 h-6 text-[#0070F3]" />
                    </div>
                    <div className="text-sm font-mono text-[#0070F3] mb-2">{item.step}</div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-zinc-400">{item.description}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-[#0a0a0a]/50 border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
                Your profit. Protected.
              </h2>
              <p className="text-lg text-zinc-400">Every feature designed to stop the bleed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/[0.05] hover:border-[#0070F3]/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/20 flex items-center justify-center mb-4 group-hover:bg-[#0070F3]/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-[#0070F3]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 mb-4">{feature.description}</p>
                  <div className="text-xs text-[#10b981] flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {feature.protection}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 border-t border-white/[0.05]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
                Start protecting your revenue.
              </h2>
              <p className="text-lg text-zinc-400">
                Most merchants recover Ghost's cost in their first week.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-8 border transition-all ${
                    plan.popular
                      ? "bg-[#0070F3]/5 border-[#0070F3]/30 scale-105 relative"
                      : "bg-[#0a0a0a] border-white/[0.05] hover:border-[#0070F3]/20"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#0070F3] text-white text-xs font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-zinc-400 mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-mono font-bold">{plan.price}</span>
                    <span className="text-zinc-500">/mo</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-[#0070F3]/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-[#0070F3]" />
                        </div>
                        <span className="text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/signup" className="block">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 rounded-xl font-medium transition-all ${
                        plan.popular
                          ? "bg-[#0070F3] text-white hover:bg-[#0070F3]/90 hover:shadow-[0_0_30px_rgba(0,112,243,0.3)]"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      Start Free Trial
                    </motion.button>
                  </Link>
                  
                  <p className="text-xs text-center text-zinc-500 mt-4">
                    7-day trial · No credit card
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 border-t border-white/[0.05] relative overflow-hidden">
          {/* Glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[600px] h-[600px] bg-[#0070F3]/20 rounded-full blur-[150px]" />
          </div>
          
          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight">
              Your checkout is leaking
              <br />
              <span className="text-[#0070F3]">right now.</span>
            </h2>
            <p className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
              Every day you wait, money walks out the door. Ghost finds the leaks in minutes—not months.
            </p>
            <Link href="/signup">
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0,112,243,0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 bg-[#0070F3] text-white font-medium rounded-xl flex items-center gap-2 mx-auto transition-colors"
              >
                Find My Revenue Leaks
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ghost className="w-5 h-5 text-[#0070F3]" />
              <span className="font-semibold">GhostCRO</span>
            </div>
            <p className="text-sm text-zinc-500">
              AI-powered checkout protection for Shopify stores. Find leaks. Fix friction. Make money.
            </p>
          </div>
          
          {[
            { title: "Product", links: ["Features", "Pricing", "Changelog"] },
            { title: "Company", links: ["About", "Blog", "Careers"] },
            { title: "Legal", links: ["Privacy", "Terms"] },
          ].map((section, i) => (
            <div key={i}>
              <h4 className="font-medium mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <span>© 2025 GhostCRO. All rights reserved.</span>
          <span>Built for merchants who hate leaving money on the table.</span>
        </div>
      </footer>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
