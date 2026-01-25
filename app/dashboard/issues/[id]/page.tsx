"use client"

import { useParams } from "next/navigation"
import { Copy, CheckCircle2 } from "lucide-react"

import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"
import { GhostInsightCard } from "@/components/ui/ghost-insight-card"

export default function IssueDetailPage() {
  const params = useParams()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-[#6B7280]">Issue ID: {params.id}</p>
        <h2 className="text-2xl font-semibold text-white mt-2">
          Checkout trust badges missing
        </h2>
        <p className="text-[#9CA3AF] mt-2 max-w-2xl">
          Customers hesitate during checkout without visual trust indicators.
          Adding security badges and guarantees can reduce abandonment.
        </p>
      </div>

      <GhostInsightCard
        title="Add security badges near payment buttons"
        description="Display PCI compliance badges and a 30-day guarantee near the payment CTA to reduce drop-off."
        severity="critical"
        impact="+12% potential lift"
      />

      <GhostCard className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Step-by-step fix</h3>
        <ol className="list-decimal list-inside text-[#9CA3AF] space-y-2">
          <li>Open your Shopify theme editor for checkout.</li>
          <li>Add the Ghost CRO trust badge snippet below.</li>
          <li>Save and preview the checkout flow on mobile and desktop.</li>
          <li>Run a follow-up scan to validate the lift.</li>
        </ol>
      </GhostCard>

      <GhostCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Code snippet</h3>
          <GhostButton variant="secondary" size="sm">
            <Copy className="h-4 w-4" />
            Copy
          </GhostButton>
        </div>
        <pre className="rounded-lg bg-[#0A0A0A] border border-[#1F1F1F] p-4 text-sm text-[#9CA3AF] overflow-auto">
{`<div class="ghost-trust-badges">
  <img src="/badges/secure-checkout.svg" alt="Secure checkout" />
  <p>30-day money-back guarantee</p>
</div>`}
        </pre>
      </GhostCard>

      <GhostCard className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Mark as fixed when ready
          </div>
          <GhostButton>Mark as Fixed</GhostButton>
        </div>
      </GhostCard>
    </div>
  )
}
