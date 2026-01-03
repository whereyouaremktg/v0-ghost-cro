"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
      
      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
          Stop guessing. Start knowing.
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect your Shopify store in 60 seconds. Get your first leak report free.
        </p>
        <Link href="/signup">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 py-6 text-lg font-medium transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl"
          >
            Find My Revenue Leaks
            <ArrowRight className="ml-2 h-5 w-5" strokeWidth={2.5} />
          </Button>
        </Link>
        <p className="text-sm text-gray-500 mt-6">
          Free 7-day trial · No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  )
}
