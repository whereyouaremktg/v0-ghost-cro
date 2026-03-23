"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Store, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ConnectStorePage() {
  const router = useRouter()
  const [shop, setShop] = useState("")
  const [loading, setLoading] = useState(false)

  const normalizeShop = (input: string): string => {
    let cleaned = input.trim().toLowerCase()
    cleaned = cleaned.replace(/^https?:\/\//, "")
    cleaned = cleaned.replace(/\/$/, "")
    if (!cleaned.includes(".myshopify.com")) {
      cleaned = cleaned.replace(/\.myshopify\.com.*/, "") + ".myshopify.com"
    }
    return cleaned
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shop.trim()) {
      toast.error("Please enter your store URL")
      return
    }

    setLoading(true)
    const normalized = normalizeShop(shop)

    try {
      // Redirect to Shopify OAuth initiation
      window.location.href = `/api/auth/shopify/initiate?shop=${encodeURIComponent(normalized)}`
    } catch {
      toast.error("Failed to connect. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="text-center">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <StepDot active label="1" />
        <StepLine />
        <StepDot label="2" />
        <StepLine />
        <StepDot label="3" />
      </div>

      <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">
        Connect your Shopify store
      </h1>
      <p className="text-[hsl(var(--text-muted))] mb-8">
        Ghost needs read-only access to analyze your theme and find revenue opportunities.
      </p>

      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-dim))]" />
              <Input
                placeholder="yourstore"
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                className="pl-10 pr-32"
                autoFocus
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(var(--text-dim))]">
                .myshopify.com
              </span>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Store"
              )}
            </Button>
          </form>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-[hsl(var(--border-default))]">
            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-muted))]">
              <Shield className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
              Read-only access
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-muted))]">
              <Shield className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
              256-bit encryption
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StepDot({ active, label }: { active?: boolean; label: string }) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
        active
          ? "bg-[hsl(var(--accent))] text-[hsl(var(--primary-foreground))]"
          : "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-muted))]"
      }`}
    >
      {label}
    </div>
  )
}

function StepLine() {
  return <div className="w-12 h-px bg-[hsl(var(--border-default))]" />
}
