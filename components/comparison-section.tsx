"use client"

import { Check, X } from "lucide-react"

const comparisonData = [
  {
    feature: "Time to insights",
    ghost: "3 minutes",
    ga: "Days of analysis",
    hotjar: "Hours of watching",
    agency: "2-4 weeks",
    diy: "Who knows",
    ghostWins: true,
  },
  {
    feature: "Prioritized fixes",
    ghost: true,
    ga: false,
    hotjar: false,
    agency: true,
    diy: false,
    ghostWins: true,
  },
  {
    feature: "Revenue attribution",
    ghost: true,
    ga: false,
    hotjar: false,
    agency: true,
    diy: false,
    ghostWins: true,
  },
  {
    feature: "Cost",
    ghost: "$99/mo",
    ga: "Free*",
    hotjar: "$39-$99/mo",
    agency: "$5K-$15K/mo",
    diy: "Free (+ time)",
    ghostWins: true,
  },
  {
    feature: "Implementation effort",
    ghost: "1-click install",
    ga: "Hours of setup",
    hotjar: "Manual setup",
    agency: "Weeks of onboarding",
    diy: "Overwhelming",
    ghostWins: true,
  },
]

export function ComparisonSection() {
  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2
            className="text-5xl md:text-6xl font-normal text-gray-900 mb-6"
            style={{ letterSpacing: '-0.03em', lineHeight: '1.05' }}
          >
            Ghost vs. The Alternatives
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ lineHeight: '1.7' }}>
            Stop piecing together tools that don't tell you what to do.
          </p>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-4 px-6 text-left text-sm font-semibold text-gray-600"
                    >
                      {/* Empty header for features column */}
                    </th>
                    <th
                      scope="col"
                      className="py-4 px-6 text-center text-sm font-semibold text-gray-900 bg-blue-50 border-x-2 border-blue-200"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base">Ghost CRO</span>
                        <span className="text-xs text-blue-600 font-medium">← That's us</span>
                      </div>
                    </th>
                    <th scope="col" className="py-4 px-6 text-center text-sm font-semibold text-gray-600">
                      Google Analytics
                    </th>
                    <th scope="col" className="py-4 px-6 text-center text-sm font-semibold text-gray-600">
                      Hotjar
                    </th>
                    <th scope="col" className="py-4 px-6 text-center text-sm font-semibold text-gray-600">
                      CRO Agency
                    </th>
                    <th scope="col" className="py-4 px-6 text-center text-sm font-semibold text-gray-600">
                      DIY
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {row.feature}
                      </td>
                      <td className="py-5 px-6 text-center bg-blue-50/50 border-x-2 border-blue-100">
                        {typeof row.ghost === "boolean" ? (
                          row.ghost ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-400">
                              <Check className="w-4 h-4 text-gray-900" strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200">
                              <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
                            </div>
                          )
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">{row.ghost}</span>
                        )}
                      </td>
                      <td className="py-5 px-6 text-center">
                        {typeof row.ga === "boolean" ? (
                          row.ga ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200">
                              <Check className="w-4 h-4 text-gray-600" strokeWidth={2} />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                              <X className="w-4 h-4 text-gray-400" strokeWidth={2} />
                            </div>
                          )
                        ) : (
                          <span className="text-sm text-gray-600">{row.ga}</span>
                        )}
                      </td>
                      <td className="py-5 px-6 text-center">
                        {typeof row.hotjar === "boolean" ? (
                          row.hotjar ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200">
                              <Check className="w-4 h-4 text-gray-600" strokeWidth={2} />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                              <X className="w-4 h-4 text-gray-400" strokeWidth={2} />
                            </div>
                          )
                        ) : (
                          <span className="text-sm text-gray-600">{row.hotjar}</span>
                        )}
                      </td>
                      <td className="py-5 px-6 text-center">
                        {typeof row.agency === "boolean" ? (
                          row.agency ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200">
                              <Check className="w-4 h-4 text-gray-600" strokeWidth={2} />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                              <X className="w-4 h-4 text-gray-400" strokeWidth={2} />
                            </div>
                          )
                        ) : (
                          <span className="text-sm text-gray-600">{row.agency}</span>
                        )}
                      </td>
                      <td className="py-5 px-6 text-center">
                        {typeof row.diy === "boolean" ? (
                          row.diy ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200">
                              <Check className="w-4 h-4 text-gray-600" strokeWidth={2} />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                              <X className="w-4 h-4 text-gray-400" strokeWidth={2} />
                            </div>
                          )
                        ) : (
                          <span className="text-sm text-gray-600">{row.diy}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            * Free, but requires hours of manual analysis to get any actionable insights
          </p>
        </div>
      </div>
    </section>
  )
}
