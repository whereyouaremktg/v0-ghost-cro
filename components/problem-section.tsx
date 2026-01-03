"use client"

import { BarChart3, TrendingUp, Bot } from "lucide-react"

export function ProblemSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Your analytics show traffic. Ghost shows truth.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            40% of your traffic isn't real customers. Your conversion rate is a lie. Ghost filters the noise and shows
            you exactly where real money is being lost.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* What you see */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-gray-400" strokeWidth={2.5} />
              <h3 className="text-lg font-semibold text-gray-900">What you see</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="text-sm text-gray-500 mb-2">Conversion Rate</div>
                <div className="text-4xl font-bold text-gray-900">2.3%</div>
                <div className="text-xs text-gray-500 mt-2">Looks good, right?</div>
              </div>
              <div className="h-32 bg-gray-100 rounded-lg flex items-end justify-center gap-2 p-4">
                {[60, 45, 70, 55, 80, 65].map((h, i) => (
                  <div key={i} className="w-8 bg-gray-300 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* What Ghost reveals */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-primary/20 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                Ghost Reveals
              </div>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" strokeWidth={2.5} />
              <h3 className="text-lg font-semibold text-gray-900">What Ghost reveals</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                <div className="text-sm text-gray-600 mb-3">Real Conversion Rate</div>
                <div className="flex items-baseline gap-3 mb-2">
                  <div className="text-4xl font-bold text-gray-900">1.4%</div>
                  <div className="text-sm text-gray-500">real humans</div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Bot className="h-4 w-4" strokeWidth={2} />
                  <span>0.9% bots filtered</span>
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <div className="text-sm text-red-600 font-medium mb-1">Revenue Leak</div>
                <div className="text-2xl font-bold text-red-600">$11,400/mo</div>
                <div className="text-xs text-gray-600 mt-1">in fixable leaks</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


