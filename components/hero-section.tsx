"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10">
        {/* Radial gradient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] opacity-20"
          style={{
            background: 'radial-gradient(ellipse at center, #BFFF00 0%, transparent 70%)',
          }}
        />

        {/* Additional glow behind mockup */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#BFFF00] opacity-10 rounded-full blur-[150px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div
            className={`text-center lg:text-left space-y-8 transition-all duration-1000 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* Announcement Banner */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-full text-sm font-medium text-white mx-auto lg:mx-0 transition-all duration-700 delay-100 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <span className="px-2 py-0.5 bg-[#BFFF00] text-gray-900 text-xs font-bold rounded-full">
                NEW
              </span>
              Synthetic Buyer Testing is here
              <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
            </div>

            {/* Headline */}
            <h1
              className={`text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-white leading-none transition-all duration-1000 delay-200 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ letterSpacing: '-0.03em', lineHeight: '1.05' }}
            >
              CRO that actually
              <br />
              tells you{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#BFFF00]">
                  what to fix first
                </span>
                {/* Glow behind lime text */}
                <span className="absolute inset-0 blur-2xl bg-[#BFFF00] opacity-30 -z-10" />
              </span>
              <span className="text-[#BFFF00]">.</span>
            </h1>

            {/* Subhead */}
            <p
              className={`mt-6 text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed transition-all duration-1000 delay-300 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ lineHeight: '1.7' }}
            >
              Ghost finds where your Shopify checkout is bleeding money—and shows you exactly how to stop it.
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 transition-all duration-1000 delay-400 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {/* Primary CTA */}
              <Link href="/signup">
                <button className="group relative px-8 py-4 bg-[#BFFF00] text-gray-900 font-medium rounded-full transition-all duration-300 hover:scale-[1.02]" style={{
                  boxShadow: '0 0 30px rgba(191, 255, 0, 0.3)',
                }}>
                  <span className="flex items-center gap-2">
                    Find My Revenue Leaks
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
                  </span>
                </button>
              </Link>

              {/* Secondary CTA */}
              <Link href="#how-it-works">
                <button className="group px-6 py-4 text-gray-400 hover:text-white font-medium transition-colors duration-300">
                  <span className="flex items-center gap-2">
                    See a sample report
                    <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1 opacity-50 group-hover:opacity-100" strokeWidth={2.5} />
                  </span>
                </button>
              </Link>
            </div>

            {/* Social Proof Bar */}
            <div
              className={`mt-12 pt-8 border-t border-gray-800 transition-all duration-1000 delay-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#BFFF00]" />
                  <span>Trusted by 150+ Shopify stores</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#BFFF00]" />
                  <span>$2.4M+ in leaks identified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#BFFF00]" />
                  <span>Works with Shopify Plus</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Mockup */}
          <div
            className={`relative transition-all duration-800 delay-600 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Enhanced glow behind mockup */}
            <div
              className="absolute inset-0 scale-110 -z-10 blur-[100px] opacity-40"
              style={{
                background: 'radial-gradient(ellipse at center, #BFFF00 0%, transparent 70%)',
              }}
            />

            {/* Browser frame with floating animation */}
            <div className="relative bg-gray-900 rounded-2xl border border-gray-800/50 overflow-hidden transform rotate-1 animate-float" style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(191, 255, 0, 0.1)',
            }}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-950 border-b border-gray-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-800 rounded-md px-3 py-1.5 text-xs text-gray-400 text-center">
                    ghostcro.app/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 space-y-4 bg-gradient-to-br from-gray-900 to-gray-950">
                {/* Ghost Score + Revenue row */}
                <div className="flex gap-4">
                  <div className="flex-1 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="text-xs text-gray-400 mb-1">Ghost Score</div>
                    <div className="text-3xl font-semibold text-white">
                      23<span className="text-gray-600">/100</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-[23%] bg-gradient-to-r from-red-400 to-orange-400 rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1 p-4 bg-gradient-to-br from-[#BFFF00]/20 to-emerald-400/10 rounded-xl border border-[#BFFF00]/20">
                    <div className="text-xs text-gray-400 mb-1">Revenue Opportunity</div>
                    <div className="text-2xl font-semibold text-white">$8,200 - $12,400</div>
                    <div className="text-xs text-gray-500">per month vs category avg</div>
                  </div>
                </div>
                
                {/* Threat cards */}
                <div className="space-y-3">
                  {/* Critical threat 1 */}
                  <div
                    className={`p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-red-500/30 transition-all duration-300 ${
                      mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    }`}
                    style={{ transitionDelay: mounted ? "700ms" : "0ms" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div>
                          <div className="font-medium text-white">Shipping Shock</div>
                          <div className="text-sm text-gray-400">Hidden costs at checkout</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-red-400">$3,200</div>
                        <div className="text-xs text-gray-500">/month</div>
                      </div>
                    </div>
                  </div>

                  {/* Critical threat 2 */}
                  <div
                    className={`p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-red-500/30 transition-all duration-300 ${
                      mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    }`}
                    style={{ transitionDelay: mounted ? "800ms" : "0ms" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div>
                          <div className="font-medium text-white">No Trust Signals</div>
                          <div className="text-sm text-gray-400">Missing reviews & badges</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-red-400">$2,800</div>
                        <div className="text-xs text-gray-500">/month</div>
                      </div>
                    </div>
                  </div>

                  {/* More threats indicator */}
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-500">+ 4 more threats identified</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -top-3 -right-3 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-full shadow-lg animate-pulse">
              6 Critical Issues
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(1deg);
          }
          50% {
            transform: translateY(-10px) rotate(1deg);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
