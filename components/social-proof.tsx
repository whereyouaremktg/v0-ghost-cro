"use client"

import { useState, useEffect, useRef } from "react"

const stats = [
  { value: "$2.4M+", label: "in leaks identified" },
  { value: "847", label: "fixes implemented" },
  { value: "34%", label: "average conversion lift" },
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder, LuxeBrand",
    category: "Fashion & Apparel",
    quote: "Ghost found $14,200 in monthly leaks we had no idea existed. We fixed three things and recovered $9,800/mo within two weeks.",
    avatar: "SC",
  },
  {
    name: "Marcus Rodriguez",
    role: "Head of Growth, TechGear",
    category: "Electronics",
    quote: "The revenue-prioritized fixes changed everything. We stopped guessing and started fixing what actually moves the needle.",
    avatar: "MR",
  },
  {
    name: "Emily Park",
    role: "CMO, HomeStyle",
    category: "Home & Living",
    quote: "Finally, a CRO tool that tells us exactly what to do. Ghost's implementation guides are so clear, our team can execute without developers.",
    avatar: "EP",
  },
]

export function SocialProof() {
  const [counted, setCounted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !counted) {
          setCounted(true)
        }
      },
      { threshold: 0.5 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [counted])

  return (
    <section id="social-proof" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto" ref={sectionRef}>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Revenue recovered.
          </h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-gray-500">{testimonial.category}</div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed italic">&ldquo;{testimonial.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
