"use client"

import { Store, BarChart3, MessageSquare, Zap, ExternalLink, CheckCircle2 } from "lucide-react"
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

  const handleConnectShopify = () => {
    // Redirect to the manual entry page or trigger auth flow directly
    router.push("/dashboard/test-shopify")
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
                    {connections.ga4 ? `Property Connected` : "Not connected"}
                  </p>
                </div>
              </div>
              {connections.ga4 && (
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              )}
            </div>
          </div>

          {connections.ga4 ? (
            <Button variant="outline" size="sm" className="w-full">Re-sync Data</Button>
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
          </div>
          <Button variant="outline" size="sm" className="w-full">
            Connect
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
          <div className="text-xs text-zinc-500">Available</div>
        </div>
      </div>
    </div>
  )
}
