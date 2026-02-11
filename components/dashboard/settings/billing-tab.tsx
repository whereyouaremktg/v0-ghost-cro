"use client"

import { useMemo, useState } from "react"
import { CreditCard, Zap, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BillingTab({ subscription }: { subscription: any }) {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const normalizedPlan = useMemo(() => {
    const plan = subscription?.plan || "free"
    return plan === "pro" ? "growth" : plan
  }, [subscription?.plan])

  const isPaid = normalizedPlan !== "free"
  const limit = subscription?.tests_limit || 3
  const used = subscription?.tests_used || 0

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    setError(null)

    try {
      const response = await fetch("/api/shopify/billing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate billing")
      }

      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate billing")
      setIsUpgrading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCanceling(true)
    setError(null)

    try {
      const response = await fetch("/api/shopify/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription")
      }

      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel subscription")
      setIsCanceling(false)
      setShowCancelConfirm(false)
    }
  }

  const usagePercent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Billing</h2>
        <p className="text-sm text-[#71717A]">Manage subscription and scan usage limits.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#1A1A1A] bg-[#111111]">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] bg-[#0F0F0F] p-5">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-[#71717A]">Current Plan</p>
            <p className="flex items-center gap-2 text-2xl font-semibold capitalize text-white">
              {normalizedPlan} Plan
              {isPaid && (
                <span className="rounded-full bg-[#FBBF24]/15 px-2 py-0.5 text-xs text-[#FBBF24]">
                  Active
                </span>
              )}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBBF24]/15 text-[#FBBF24]">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF]">Monthly Analysis Usage</span>
              <span className="text-[#71717A]">
                {used} / {limit} runs
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
              <div
                className="h-full rounded-full bg-[#FBBF24] transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          {!isPaid && (
            <div className="flex items-start gap-4 rounded-lg border border-[#FBBF24]/20 bg-[#FBBF24]/10 p-4">
              <div className="rounded-md bg-[#FBBF24]/15 p-2">
                <Zap className="h-5 w-5 text-[#FBBF24]" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">Upgrade to Growth</h4>
                <p className="mb-3 mt-1 text-xs text-[#9CA3AF]">
                  Unlock higher scan volume, deeper analysis, and priority support.
                </p>
                {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
                <Button
                  size="sm"
                  className="w-full bg-[#FBBF24] text-[#0A0A0A] hover:bg-[#F59E0B] md:w-auto"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Upgrade Plan"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isPaid && (
        <div className="rounded-xl border border-[#1A1A1A] bg-[#111111] p-5">
          <h3 className="mb-2 text-sm font-semibold text-white">Cancel Subscription</h3>
          <p className="mb-4 text-sm text-[#71717A]">
            Cancel your subscription and return to the free tier at the end of your billing cycle.
          </p>

          {showCancelConfirm ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-300">
                    Are you sure you want to cancel?
                  </p>
                  <p className="mb-3 mt-1 text-xs text-red-200">
                    You will lose paid features after your current billing period.
                  </p>
                  {error && <p className="mb-2 text-xs text-red-300">{error}</p>}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={isCanceling}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isCanceling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Canceling...
                        </>
                      ) : (
                        "Yes, Cancel"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={isCanceling}
                      className="border-[#2A2A2A] bg-transparent text-white hover:bg-[#1A1A1A]"
                    >
                      Keep Subscription
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 bg-transparent text-red-300 hover:bg-red-500/10 hover:text-red-200"
              onClick={() => setShowCancelConfirm(true)}
            >
              Cancel Subscription
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
