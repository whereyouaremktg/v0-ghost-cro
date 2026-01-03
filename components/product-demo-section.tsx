"use client"

import { TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react"

export function ProductDemoSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Revenue protection that never sleeps.
          </h2>
        </div>

        <div className="relative">
          {/* Main dashboard mockup */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 lg:p-12">
            {/* Browser frame */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
              </div>
              <div className="flex-1 h-8 bg-gray-50 rounded-lg border border-gray-200" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Leak Monitor */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-xl p-6 relative">
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" strokeWidth={2.5} />
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Live Money Leak</span>
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-red-600 mb-1">$6,240</div>
                  <div className="text-sm text-gray-600 mb-3">per month</div>
                  <div className="h-2 bg-red-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: "78%" }} />
                  </div>
                </div>

                {/* Threat Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-orange-600" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="text-base font-semibold text-gray-900 mb-1">Shipping Shock</div>
                        <div className="text-xs text-gray-600">High Severity</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">$3,200</div>
                      <div className="text-xs text-gray-500">/mo</div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: "65%" }} />
                  </div>
                </div>
              </div>

              {/* Recovery Plan */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={2.5} />
                  <h3 className="text-sm font-semibold text-gray-900">Recovery Plan</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { fix: "Add shipping calculator", impact: "$2,100/mo", priority: 1 },
                    { fix: "Show trust badges", impact: "$800/mo", priority: 2 },
                    { fix: "Simplify checkout form", impact: "$300/mo", priority: 3 },
                  ].map((item) => (
                    <div key={item.priority} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                            {item.priority}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{item.fix}</span>
                        </div>
                        <span className="text-sm font-bold text-primary">{item.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating annotation callouts */}
          <div className="absolute -left-4 top-20 hidden lg:block">
            <div className="bg-white rounded-lg p-3 shadow-lg border border-gray-200 max-w-[200px]">
              <div className="text-xs font-semibold text-gray-900 mb-1">Real-time monitoring</div>
              <div className="text-xs text-gray-600">Updates every scan</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

