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
        body: JSON.stringify({ plan: "growth" }),
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
        <p className="text-sm text-[var(--ghost-text-dim)]">Manage subscription and scan usage limits.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--ghost-bg-elevated)] bg-[var(--ghost-bg-secondary)]">
        <div className="flex items-center justify-between border-b border-[var(--ghost-bg-elevated)] bg-[var(--ghost-bg-primary)] p-5">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-[var(--ghost-text-dim)]">Current Plan</p>
            <p className="flex items-center gap-2 text-2xl font-semibold capitalize text-white">
              {normalizedPlan} Plan
              {isPaid && (
                <span className="rounded-full bg-[var(--ghost-accent-primary)]/15 px-2 py-0.5 text-xs text-[var(--ghost-accent-primary)]">
                  Active
                </span>
              )}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ghost-accent-primary)]/15 text-[var(--ghost-accent-primary)]">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-[var(--ghost-text-muted)]">Monthly Analysis Usage</span>
              <span className="text-[var(--ghost-text-dim)]">
                {used} / {limit} runs
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--ghost-bg-elevated)]">
              <div
                className="h-full rounded-full bg-[var(--ghost-accent-primary)] transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          {!isPaid && (
            <div className="flex items-start gap-4 rounded-lg border border-[var(--ghost-accent-primary)]/20 bg-[var(--ghost-accent-primary)]/10 p-4">
              <div className="rounded-md bg-[var(--ghost-accent-primary)]/15 p-2">
                <Zap className="h-5 w-5 text-[var(--ghost-accent-primary)]" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">Upgrade to Growth</h4>
                <p className="mb-3 mt-1 text-xs text-[var(--ghost-text-muted)]">
                  Unlock higher scan volume, deeper analysis, and priority support.
                </p>
                {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
                <Button
                  size="sm"
                  className="w-full bg-[var(--ghost-accent-primary)] text-[var(--ghost-bg-primary)] hover:bg-[var(--ghost-accent-secondary)] md:w-auto"
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
        <div className="rounded-xl border border-[var(--ghost-bg-elevated)] bg-[var(--ghost-bg-secondary)] p-5">
          <h3 className="mb-2 text-sm font-semibold text-white">Cancel Subscription</h3>
          <p className="mb-4 text-sm text-[var(--ghost-text-dim)]">
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
                      className="border-[var(--ghost-border-hover)] bg-transparent text-white hover:bg-[var(--ghost-bg-elevated)]"
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
