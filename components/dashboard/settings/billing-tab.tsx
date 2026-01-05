"use client"

import { CreditCard, Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function BillingTab({ subscription }: { subscription: any }) {
  const router = useRouter()
  const plan = subscription?.plan || "free"
  const isPro = plan === "enterprise" || plan === "pro"
  const limit = subscription?.tests_limit || 3
  const used = subscription?.tests_used || 0

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
              {isPro && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Pro</span>}
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
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
                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((used / limit) * 100, 100)}%` }} 
              />
            </div>
          </div>

          {!isPro && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-md">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 text-sm">Upgrade to Enterprise</h4>
                <p className="text-xs text-blue-700 mt-1 mb-3">
                  Unlock unlimited simulations, competitor analysis, and priority support.
                </p>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto" onClick={() => router.push('/pricing')}>
                  Upgrade Plan
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
              <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
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
    </div>
  )
}
