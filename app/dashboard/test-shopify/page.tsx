"use client"

import { useState, useEffect } from "react"
import { Store, RefreshCw } from "lucide-react"

export default function TestShopifyPage() {
  const [shopifyStore, setShopifyStore] = useState<any>(null)
  const [metricsData, setMetricsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load Shopify connection from localStorage
    const stored = localStorage.getItem("shopifyStore")
    if (stored) {
      try {
        setShopifyStore(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to parse shopify store data:", error)
      }
    }
  }, [])

  const fetchMetrics = async () => {
    if (!shopifyStore) {
      setError("No Shopify store connected")
      return
    }

    setLoading(true)
    setError(null)
    setMetricsData(null)

    try {
      const response = await fetch("/api/shopify/metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shop: shopifyStore.shop,
          accessToken: shopifyStore.accessToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(`Error ${response.status}: ${JSON.stringify(data, null, 2)}`)
      } else {
        setMetricsData(data)
      }
    } catch (err) {
      setError(`Request failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Shopify Integration Test</h1>
        <p className="text-muted-foreground">Debug page to test Shopify metrics API</p>
      </div>

      {/* Store Info */}
      <div className="bg-card border-2 border-border brutal-shadow p-6 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
          Connected Store Info
        </h2>

        {shopifyStore ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-4 bg-primary/10 border-2 border-primary">
              <Store className="h-5 w-5 text-primary" strokeWidth={3} />
              <div>
                <div className="font-bold text-sm">{shopifyStore.shop}</div>
                <div className="text-xs text-muted-foreground">
                  Connected {new Date(shopifyStore.connectedAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="bg-muted p-4 font-mono text-xs overflow-auto">
              <pre>{JSON.stringify(shopifyStore, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">
            No Shopify store connected. Go to{" "}
            <a href="/dashboard/settings" className="text-primary underline">
              Settings
            </a>{" "}
            to connect.
          </div>
        )}
      </div>

      {/* Fetch Metrics Button */}
      {shopifyStore && (
        <div className="mb-6">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} strokeWidth={3} />
            {loading ? "Fetching..." : "Fetch Metrics"}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border-2 border-destructive p-6 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-destructive mb-4">Error</h2>
          <pre className="text-sm text-destructive whitespace-pre-wrap font-mono overflow-auto">{error}</pre>
        </div>
      )}

      {/* Metrics Data Display */}
      {metricsData && (
        <div className="bg-card border-2 border-border brutal-shadow p-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
            Metrics Response (Raw JSON)
          </h2>
          <div className="bg-muted p-4 font-mono text-xs overflow-auto">
            <pre>{JSON.stringify(metricsData, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
