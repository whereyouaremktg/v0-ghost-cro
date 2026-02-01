"use client"

import { useState } from "react"
import { Store, BarChart3, MessageSquare, Zap, ExternalLink, CheckCircle2, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface IntegrationsTabProps {
  connections: {
    shopify: boolean
    shopifyShop: string | null
    ga4: boolean
    ga4Property: string | null
  }
}

export function IntegrationsTab({ connections }: IntegrationsTabProps) {
  const router = useRouter()
  const [isDisconnectingGA4, setIsDisconnectingGA4] = useState(false)

  const handleConnectShopify = () => {
    // Trigger Shopify OAuth flow directly
    window.location.href = "/api/auth/shopify/initiate"
  }

  const handleDisconnectGA4 = async () => {
    if (!confirm("Are you sure you want to disconnect Google Analytics 4? This will stop demographic data from being used in your analysis.")) {
      return
    }

    setIsDisconnectingGA4(true)
    try {
      const response = await fetch('/api/analytics/ga4/disconnect', {
        method: 'POST',
      })

      if (response.ok) {
        // Refresh the page to update connection status
        window.location.reload()
      } else {
        console.error('Failed to disconnect GA4')
      }
    } catch (error) {
      console.error('Failed to disconnect GA4', error)
    } finally {
      setIsDisconnectingGA4(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-1">Integrations</h2>
        <p className="text-sm text-zinc-500">Connect your tools and services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Shopify Card */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6 flex flex-col justify-between transition-all hover:border-zinc-300">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                  <Store className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Shopify</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {connections.shopify ? connections.shopifyShop : "Not connected"}
                  </p>
                </div>
              </div>
              {connections.shopify && (
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              )}
            </div>
          </div>

          {connections.shopify ? (
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => window.open(`https://${connections.shopifyShop}/admin`, '_blank')}>
              Manage Store <ExternalLink className="h-3 w-3" />
            </Button>
          ) : (
            <Button variant="default" size="sm" className="w-full bg-[#008060] hover:bg-[#006e52] text-white" onClick={handleConnectShopify}>
              Connect Store
            </Button>
          )}
        </div>

        {/* GA4 Card */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6 flex flex-col justify-between transition-all hover:border-zinc-300">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg border border-orange-100">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Google Analytics 4</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {connections.ga4
                      ? connections.ga4Property
                        ? `Property: ${connections.ga4Property}`
                        : "Connected"
                      : "Not connected"}
                  </p>
                </div>
              </div>
              {connections.ga4 && (
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              )}
            </div>
            {connections.ga4 && (
              <p className="text-xs text-zinc-500 mb-4">
                Demographics data will be used to create more accurate customer personas.
              </p>
            )}
          </div>

          {connections.ga4 ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push('/api/auth/google-analytics')}>
                Re-connect
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDisconnectGA4}
                disabled={isDisconnectingGA4}
              >
                {isDisconnectingGA4 ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/api/auth/google-analytics')}>
              Connect GA4
            </Button>
          )}
        </div>

        {/* Slack */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Slack</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Send leak alerts to #ghost-alerts</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-full border border-blue-200">
              Soon
            </span>
          </div>
          <Button variant="outline" size="sm" className="w-full" disabled>
            Coming Soon
          </Button>
        </div>

        {/* Shopify Flow */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-50 rounded-lg">
                <Zap className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Shopify Flow</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Trigger workflows when leaks are detected</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-full border border-blue-200">
              Enterprise
            </span>
          </div>
          <Button variant="outline" size="sm" className="w-full" disabled>
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  )
}
