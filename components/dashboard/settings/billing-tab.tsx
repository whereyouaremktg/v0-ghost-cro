"use client"

import { useState } from "react"
import { CreditCard, Zap, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BillingTab({ subscription }: { subscription: any }) {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const plan = subscription?.plan || "free"
  const isPro = plan === "enterprise" || plan === "pro"
  const limit = subscription?.tests_limit || 3
  const used = subscription?.tests_used || 0

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    setError(null)

    try {
      const response = await fetch('/api/shopify/billing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate billing')
      }

      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate billing')
      setIsUpgrading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCanceling(true)
    setError(null)

    try {
      const response = await fetch('/api/shopify/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      // Refresh page to show updated subscription status
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription')
      setIsCanceling(false)
      setShowCancelConfirm(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-1">Billing</h2>
        <p className="text-sm text-zinc-500">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan Card */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Current Plan</div>
            <div className="text-2xl font-bold text-zinc-900 capitalize flex items-center gap-2">
              {plan} Plan
              {isPro && <span className="text-xs bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded-full">Pro</span>}
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#FBBF24]">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-zinc-700">Monthly Analysis Usage</span>
              <span className="text-zinc-500">{used} / {limit} runs</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FBBF24] rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((used / limit) * 100, 100)}%` }} 
              />
            </div>
          </div>

          {!isPro && (
            <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-4 flex items-start gap-4">
              <div className="p-2 bg-[#FDE68A] rounded-md">
                <Zap className="h-5 w-5 text-[#FBBF24]" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#92400E] text-sm">Upgrade to Enterprise</h4>
                <p className="text-xs text-[#D97706] mt-1 mb-3">
                  Unlock unlimited simulations, competitor analysis, and priority support.
                </p>
                {error && (
                  <p className="text-xs text-red-600 mb-2">{error}</p>
                )}
                <Button
                  size="sm"
                  className="bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0A0A0A] w-full md:w-auto"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Upgrade Plan'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Method */}
      {isPro && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Payment Method</h3>
          <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 bg-zinc-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-[#FBBF24] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Visa ending in 4242</p>
                <p className="text-xs text-zinc-500">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </div>
      )}

      {/* Invoice History */}
      {isPro && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Invoice History</h3>
          <div className="space-y-2">
            <div className="text-sm text-zinc-500 text-center py-4">
              No invoices yet
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription */}
      {isPro && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-2">Cancel Subscription</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Cancel your subscription and return to the free plan. You'll lose access to Pro features at the end of your billing period.
          </p>

          {showCancelConfirm ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    Are you sure you want to cancel?
                  </p>
                  <p className="text-xs text-red-700 mt-1 mb-3">
                    You'll be downgraded to the free plan with limited features.
                  </p>
                  {error && (
                    <p className="text-xs text-red-600 mb-2">{error}</p>
                  )}
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
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Canceling...
                        </>
                      ) : (
                        'Yes, Cancel Subscription'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={isCanceling}
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
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
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
