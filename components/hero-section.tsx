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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-white" />
        
        {/* Subtle radial glow behind mockup */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[800px] h-[800px] bg-lime-300/20 rounded-full blur-[120px]" />
        
        {/* Optional: very subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div 
            className={`text-center lg:text-left space-y-8 transition-all duration-1000 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-gray-900 leading-[1.1]">
              CRO that actually
              <br />
              tells you{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-500">
                  what to fix first
                </span>
                {/* Subtle glow behind lime text */}
                <span className="absolute inset-0 blur-2xl bg-lime-400/30 -z-10" />
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-500">.</span>
            </h1>

            {/* Subhead - refined */}
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Ghost finds where your Shopify checkout is bleeding money—and shows you exactly how to stop it.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              {/* Primary CTA */}
              <Link href="/signup">
                <button className="group relative px-8 py-4 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-lime-400/25 hover:-translate-y-0.5">
                  <span className="flex items-center gap-2">
                    Find My Revenue Leaks
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
                  </span>
                </button>
              </Link>

              {/* Secondary CTA */}
              <Link href="#how-it-works">
                <button className="group px-6 py-4 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-300">
                  <span className="flex items-center gap-2">
                    See a sample report
                    <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1 opacity-50 group-hover:opacity-100" strokeWidth={2.5} />
                  </span>
                </button>
              </Link>
            </div>

            {/* Social Proof Bar - Elevated */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-lime-400" />
                  <span>Trusted by 150+ Shopify stores</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-lime-400" />
                  <span>$2.4M+ in leaks identified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-lime-400" />
                  <span>Works with Shopify Plus</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Mockup */}
          <div 
            className={`relative transition-all duration-800 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Glow behind mockup */}
            <div className="absolute inset-0 bg-gradient-to-r from-lime-400/20 to-emerald-400/20 blur-3xl scale-110 -z-10" />
            
            {/* Browser frame */}
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-900/10 border border-gray-200/50 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-100 rounded-md px-3 py-1.5 text-xs text-gray-400 text-center">
                    ghostcro.app/dashboard
                  </div>
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-6 space-y-4">
                {/* Ghost Score + Revenue row */}
                <div className="flex gap-4">
                  <div className="flex-1 p-4 bg-gray-50 rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Ghost Score</div>
                    <div className="text-3xl font-semibold text-gray-900">
                      23<span className="text-gray-300">/100</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-[23%] bg-gradient-to-r from-red-400 to-orange-400 rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1 p-4 bg-gradient-to-br from-lime-50 to-emerald-50 rounded-xl border border-lime-100">
                    <div className="text-xs text-gray-500 mb-1">Revenue Opportunity</div>
                    <div className="text-2xl font-semibold text-gray-900">$8,200 - $12,400</div>
                    <div className="text-xs text-gray-500">per month vs category avg</div>
                  </div>
                </div>
                
                {/* Threat cards */}
                <div className="space-y-3">
                  {/* Critical threat 1 */}
                  <div 
                    className={`p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ${
                      mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    }`}
                    style={{ transitionDelay: mounted ? "400ms" : "0ms" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div>
                          <div className="font-medium text-gray-900">Shipping Shock</div>
                          <div className="text-sm text-gray-500">Hidden costs at checkout</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-red-500">$3,200</div>
                        <div className="text-xs text-gray-400">/month</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Critical threat 2 */}
                  <div 
                    className={`p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300 ${
                      mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    }`}
                    style={{ transitionDelay: mounted ? "500ms" : "0ms" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div>
                          <div className="font-medium text-gray-900">No Trust Signals</div>
                          <div className="text-sm text-gray-500">Missing reviews & badges</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-red-500">$2,800</div>
                        <div className="text-xs text-gray-400">/month</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* More threats indicator */}
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-400">+ 4 more threats identified</span>
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
    </section>
  )
}
