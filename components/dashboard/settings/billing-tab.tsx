"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BillingTab() {
  const invoices = [
    { date: "2024-01-15", amount: "$199.00", pdf: "#" },
    { date: "2023-12-15", amount: "$199.00", pdf: "#" },
    { date: "2023-11-15", amount: "$199.00", pdf: "#" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-1">Billing</h2>
        <p className="text-sm text-zinc-500">Manage your subscription and payment methods</p>
      </div>

      {/* Plan Card */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">Ghost Enterprise</h3>
            <p className="text-2xl font-light font-mono text-zinc-900">$199/mo</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-200">
            Active
          </span>
        </div>

        {/* Usage Bar */}
        <div className="mt-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-600">Simulations Run</span>
            <span className="text-xs font-mono text-zinc-900">14,020 / 50,000</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${(14020 / 50000) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
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

      {/* Invoice History */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Invoice History</h3>
        <div className="space-y-2">
          {invoices.map((invoice, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  {new Date(invoice.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-zinc-500">{invoice.amount}</p>
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                <ExternalLink className="h-3 w-3" />
                PDF
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

