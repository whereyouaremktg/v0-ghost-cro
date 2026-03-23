"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Scan, Loader2, Zap, Smartphone, ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PERSONA_MIXES = [
  { value: "balanced", label: "Balanced", description: "Standard shopper mix" },
  { value: "price-sensitive", label: "Price Sensitive", description: "Cost-conscious buyers" },
  { value: "mobile-heavy", label: "Mobile Heavy", description: "Mobile-first users" },
  { value: "skeptical", label: "Skeptical", description: "Trust-focused buyers" },
]

export default function ScannerPage() {
  const router = useRouter()
  const { userId } = useAuthUserId()
  const [store, setStore] = useState<{ shop: string } | null>(null)
  const [personaMix, setPersonaMix] = useState("balanced")
  const [scanConfig, setScanConfig] = useState({
    analyzeTheme: true,
    analyzeCheckout: true,
    analyzeSpeed: true,
  })
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase
      .from("stores")
      .select("shop")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setStore(data)
      })
  }, [userId])

  const handleScan = async () => {
    if (!store?.shop) {
      toast.error("No store connected")
      return
    }

    setRunning(true)
    try {
      // Auto-discover the main product URL
      const discoverRes = await fetch(
        `/api/shopify/auto-discover?shop=${encodeURIComponent(store.shop)}`
      )
      let url = `https://${store.shop}`
      if (discoverRes.ok) {
        const discoverData = await discoverRes.json()
        if (discoverData.url) url = discoverData.url
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          personaMix,
          shop: store.shop,
          scanConfig,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || "Failed to start scan")
        return
      }

      const data = await res.json()
      if (data.testId) {
        router.push(`/onboarding/scanning?testId=${data.testId}`)
      } else {
        toast.error("Unexpected response from scan")
      }
    } catch {
      toast.error("Failed to start scan")
    } finally {
      setRunning(false)
    }
  }

  const toggleConfig = (key: keyof typeof scanConfig) => {
    setScanConfig((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Run a Scan</h2>
        <p className="text-sm text-[hsl(var(--text-muted))]">
          Configure and run an AI-powered analysis of your store.
        </p>
      </div>

      {/* Store info */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="label-uppercase mb-1">Connected Store</p>
              <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                {store?.shop || "Loading..."}
              </p>
            </div>
            <Badge variant="success">Connected</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Scan config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analysis Scope</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ConfigToggle
            icon={Scan}
            label="Theme Analysis"
            description="UX friction, conversion blockers, trust signals"
            enabled={scanConfig.analyzeTheme}
            onToggle={() => toggleConfig("analyzeTheme")}
          />
          <ConfigToggle
            icon={ShoppingCart}
            label="Checkout Analysis"
            description="Cart experience with AI buyer personas"
            enabled={scanConfig.analyzeCheckout}
            onToggle={() => toggleConfig("analyzeCheckout")}
          />
          <ConfigToggle
            icon={Zap}
            label="Speed Analysis"
            description="Page load performance and metrics"
            enabled={scanConfig.analyzeSpeed}
            onToggle={() => toggleConfig("analyzeSpeed")}
          />
        </CardContent>
      </Card>

      {/* Persona mix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Persona Mix</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={personaMix} onValueChange={setPersonaMix}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERSONA_MIXES.map((mix) => (
                <SelectItem key={mix.value} value={mix.value}>
                  {mix.label} — {mix.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Run button */}
      <Button
        onClick={handleScan}
        disabled={running || !store}
        className="w-full"
        size="lg"
      >
        {running ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting scan...
          </>
        ) : (
          <>
            <Scan className="h-4 w-4" />
            Run Scan
          </>
        )}
      </Button>
    </div>
  )
}

function ConfigToggle({
  icon: Icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
        enabled
          ? "border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.05)]"
          : "border-[hsl(var(--border-default))] bg-transparent hover:bg-[hsl(var(--surface-2))]"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          enabled ? "bg-[hsl(var(--accent)/0.15)]" : "bg-[hsl(var(--surface-2))]"
        }`}
      >
        <Icon className={`h-4 w-4 ${enabled ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--text-dim))]"}`} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${enabled ? "text-[hsl(var(--text-primary))]" : "text-[hsl(var(--text-muted))]"}`}>
          {label}
        </p>
        <p className="text-xs text-[hsl(var(--text-dim))]">{description}</p>
      </div>
      <div
        className={`w-9 h-5 rounded-full transition-colors ${
          enabled ? "bg-[hsl(var(--accent))]" : "bg-[hsl(var(--surface-3))]"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform ${
            enabled ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  )
}
