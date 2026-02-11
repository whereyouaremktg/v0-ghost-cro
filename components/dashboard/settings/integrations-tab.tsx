"use client"

import { useState, useEffect } from "react"
import {
  Store,
  BarChart3,
  MessageSquare,
  Zap,
  ExternalLink,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { Ga4PropertyModal } from "./ga4-property-modal"

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
  const searchParams = useSearchParams()
  const [isDisconnectingGA4, setIsDisconnectingGA4] = useState(false)
  const [showGa4PropertyModal, setShowGa4PropertyModal] = useState(false)

  useEffect(() => {
    if (searchParams.get("show_property_modal") !== "true") {
      return
    }

    setShowGa4PropertyModal(true)

    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete("show_property_modal")
    if (!nextParams.get("tab")) {
      nextParams.set("tab", "integrations")
    }

    const nextQuery = nextParams.toString()
    const nextUrl = nextQuery ? `/dashboard/settings?${nextQuery}` : "/dashboard/settings?tab=integrations"
    router.replace(nextUrl, { scroll: false })
  }, [searchParams, router])

  const handleGa4ModalClose = (open: boolean) => {
    setShowGa4PropertyModal(open)
    if (!open) {
      router.replace("/dashboard/settings?tab=integrations", { scroll: false })
    }
  }

  const handleGa4Saved = () => {
    router.replace("/dashboard/settings?tab=integrations", { scroll: false })
    window.location.reload()
  }

  const handleConnectShopify = () => {
    window.location.href = "/api/auth/shopify/initiate"
  }

  const handleDisconnectGA4 = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect Google Analytics 4? This will stop demographic data from being used in your analysis.",
      )
    ) {
      return
    }

    setIsDisconnectingGA4(true)
    try {
      const response = await fetch("/api/analytics/ga4/disconnect", {
        method: "POST",
      })

      if (response.ok) {
        window.location.reload()
      } else {
        console.error("Failed to disconnect GA4")
      }
    } catch (error) {
      console.error("Failed to disconnect GA4", error)
    } finally {
      setIsDisconnectingGA4(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Integrations</h2>
        <p className="text-sm text-[#71717A]">Connect data sources used by Ghost analysis.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-[#1A1A1A] bg-[#111111] p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#95BF47]/15 p-2">
                <Store className="h-5 w-5 text-[#95BF47]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Shopify</p>
                <p className="text-xs text-[#71717A]">
                  {connections.shopify ? connections.shopifyShop : "Not connected"}
                </p>
              </div>
            </div>
            {connections.shopify && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </span>
            )}
          </div>

          {connections.shopify ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#2A2A2A] bg-transparent text-white hover:bg-[#1A1A1A]"
              onClick={() => window.open(`https://${connections.shopifyShop}/admin`, "_blank")}
            >
              Manage Store
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="w-full bg-[#008060] text-white hover:bg-[#006e52]"
              onClick={handleConnectShopify}
            >
              Connect Store
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-[#1A1A1A] bg-[#111111] p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#3B82F6]/15 p-2">
                <BarChart3 className="h-5 w-5 text-[#60A5FA]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Google Analytics 4</p>
                <p className="text-xs text-[#71717A]">
                  {connections.ga4
                    ? connections.ga4Property
                      ? `Property: ${connections.ga4Property}`
                      : "Connected"
                    : "Not connected"}
                </p>
              </div>
            </div>
            {connections.ga4 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </span>
            )}
          </div>

          {connections.ga4 ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-[#2A2A2A] bg-transparent text-white hover:bg-[#1A1A1A]"
                onClick={() => router.push("/api/auth/google-analytics")}
              >
                Re-connect
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-500/30 bg-transparent text-red-300 hover:bg-red-500/10"
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
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#2A2A2A] bg-transparent text-white hover:bg-[#1A1A1A]"
              onClick={() => router.push("/api/auth/google-analytics")}
            >
              Connect GA4
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-[#1A1A1A] bg-[#111111] p-5 opacity-80">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#8B5CF6]/15 p-2">
                <MessageSquare className="h-5 w-5 text-[#A78BFA]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Slack</p>
                <p className="text-xs text-[#71717A]">Send leak alerts to your ops channel.</p>
              </div>
            </div>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
              Soon
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-[#2A2A2A] bg-transparent text-[#71717A]"
            disabled
          >
            Coming Soon
          </Button>
        </div>

        <div className="rounded-xl border border-[#1A1A1A] bg-[#111111] p-5 opacity-80">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#FBBF24]/15 p-2">
                <Zap className="h-5 w-5 text-[#FBBF24]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Shopify Flow</p>
                <p className="text-xs text-[#71717A]">Trigger automations for high-impact leaks.</p>
              </div>
            </div>
            <span className="rounded-full border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-2 py-0.5 text-[10px] font-semibold text-[#FBBF24]">
              Enterprise
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-[#2A2A2A] bg-transparent text-[#71717A]"
            disabled
          >
            Contact Sales
          </Button>
        </div>
      </div>

      <Ga4PropertyModal
        open={showGa4PropertyModal}
        onOpenChange={handleGa4ModalClose}
        onSaved={handleGa4Saved}
      />
    </div>
  )
}
