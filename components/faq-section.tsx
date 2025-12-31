"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    question: "What do I get in the report?",
    answer:
      "You'll receive a comprehensive analysis including: friction point mapping with severity ratings, synthetic shopper insights from multiple personas, prioritized fix recommendations ranked by revenue impact, and a detailed breakdown of what's working well. Each recommendation includes implementation guidance and expected impact.",
  },
  {
    question: "How long does the analysis take?",
    answer:
      "Our AI completes the full analysis in about 5 minutes. You'll receive an email notification as soon as your report is ready, along with a link to view it online or download as a PDF.",
  },
  {
    question: "Do you need access to my Shopify admin?",
    answer:
      "No, we don't need any access to your Shopify admin or analytics. Our AI analyzes your checkout flow from the customer's perspective—just like a real shopper would. We only need your store URL.",
  },
  {
    question: "What if I'm not satisfied?",
    answer:
      "We offer a 100% money-back guarantee. If you don't find actionable insights in your report that can improve your conversion rate, we'll refund your payment in full—no questions asked.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground uppercase mb-4">FAQ</h2>
          <p className="text-xl text-muted-foreground font-medium">Everything you need to know about Ghost CRO</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card border-3 border-foreground brutal-shadow"
              style={{ transform: `rotate(${index % 2 === 0 ? "-0.3" : "0.3"}deg)` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-6 flex items-center justify-between gap-4 font-bold text-lg sm:text-xl uppercase tracking-wide hover:bg-muted/50 transition-colors"
              >
                <span>{faq.question}</span>
                <div className="w-10 h-10 bg-primary border-2 border-foreground flex items-center justify-center shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5" strokeWidth={3} />
                  ) : (
                    <Plus className="w-5 h-5" strokeWidth={3} />
                  )}
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 border-t-3 border-foreground pt-4">
                  <p className="text-muted-foreground text-lg leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
