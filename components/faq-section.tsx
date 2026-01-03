"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How is Ghost different from Google Analytics or Hotjar?",
    answer:
      "Google Analytics shows you what happened. Hotjar shows you where people clicked. Ghost shows you why they left and what to fix first. We use AI to simulate real buyer behavior, identify revenue leaks, and prioritize fixes by dollar impact—not just data points.",
  },
  {
    question: "How quickly will I see results?",
    answer:
      "Most merchants see their first leak report within 5 minutes of connecting their store. After implementing the top 3 prioritized fixes, typical recovery is $2,000-$10,000/month within 2-4 weeks. Ghost continuously monitors and updates as you make changes.",
  },
  {
    question: "Do I need technical skills to use Ghost?",
    answer:
      "No. Ghost provides step-by-step implementation guides for every fix. Most optimizations can be done in Shopify's theme editor or with simple copy changes. For more complex fixes, we provide clear instructions you can share with your developer.",
  },
  {
    question: "What Shopify plans does Ghost work with?",
    answer:
      "Ghost works with all Shopify plans—Basic, Shopify, Advanced, and Plus. We connect via the Shopify API and analyze your checkout flow regardless of your plan tier.",
  },
  {
    question: "What if Ghost doesn't find any leaks?",
    answer:
      "If your checkout is already optimized, Ghost will confirm that and provide competitive benchmarks showing how you compare. You can cancel anytime during your free trial with no charges.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. There are no long-term contracts. Cancel anytime from your account settings. Your data remains accessible for 30 days after cancellation.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Questions? Answered.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  strokeWidth={2.5}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
