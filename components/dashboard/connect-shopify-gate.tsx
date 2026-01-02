"use client"

import { useState, useEffect } from "react"
import { Store, Sparkles, ArrowRight, Check } from "lucide-react"
import Link from "next/link"

interface ConnectShopifyGateProps {
  onConnect?: () => void
}

export function ConnectShopifyGate({ onConnect }: ConnectShopifyGateProps) {
  const [shopName, setShopName] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnectShopify = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (!shopName.trim()) {
      console.warn("Shop name is required")
      return
    }

    console.log("Connecting to Shopify...", shopName)
    setIsConnecting(true)

    // Clean the shop name
    let cleanShop = shopName.trim()
    cleanShop = cleanShop.replace(/^https?:\/\//, "")
    cleanShop = cleanShop.replace(/\/$/, "")

    // Ensure the shop name ends with .myshopify.com
    const formattedShop = cleanShop.includes(".myshopify.com")
      ? cleanShop
      : `${cleanShop}.myshopify.com`

    console.log("Formatted shop:", formattedShop)
    console.log("Redirecting to:", `/api/auth/shopify?shop=${encodeURIComponent(formattedShop)}`)

    // Redirect to Shopify OAuth
    try {
      window.location.href = `/api/auth/shopify?shop=${encodeURIComponent(formattedShop)}`
    } catch (error) {
      console.error("Failed to redirect:", error)
      setIsConnecting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 border border-primary/30 rounded-2xl mb-4">
            <Sparkles className="h-10 w-10 text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight font-heading">Welcome to Ghost CRO</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Connect your Shopify store to unlock AI-powered checkout analysis and revenue optimization.
          </p>
        </div>

        {/* Connect Card */}
        <div className="bg-card border border-border/30 rounded-2xl shadow-lg p-8 space-y-6 card-hover">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight font-heading">Connect Your Store</h2>
            <p className="text-sm text-muted-foreground">
              Ghost needs access to analyze your checkout flow and identify revenue leaks.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium tracking-wide mb-2">
                Shopify Store Name
              </label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={2.5} />
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleConnectShopify()}
                  placeholder="your-store.myshopify.com"
                  className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                  disabled={isConnecting}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Enter your store name (e.g., "your-store" or "your-store.myshopify.com")
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                console.log("Button clicked", { shopName, isConnecting })
                handleConnectShopify(e)
              }}
              disabled={!shopName.trim() || isConnecting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-medium tracking-wide rounded-xl accent-glow transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
              style={{ pointerEvents: isConnecting ? 'none' : 'auto' }}
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Store className="h-4 w-4" strokeWidth={2.5} />
                  Connect Shopify Store
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>

          {/* Benefits */}
          <div className="pt-6 border-t border-border/30">
            <p className="text-xs font-medium tracking-wide text-muted-foreground mb-3">What you'll get:</p>
            <div className="space-y-2.5">
              {[
                "AI-powered checkout analysis",
                "Real-time revenue leak detection",
                "Personalized friction point identification",
                "Actionable optimization recommendations",
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="pt-4 border-t border-border/20">
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              <span className="font-medium">Privacy & Security:</span> Ghost only reads analytics and checkout
              data. We never modify your store, access customer payment details, or store sensitive information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

