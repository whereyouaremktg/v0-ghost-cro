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
    <section id="social-proof" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gray-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10" ref={sectionRef}>
        <div className="text-center mb-20">
          <h2
            className="text-5xl md:text-6xl font-normal text-white mb-4"
            style={{ letterSpacing: '-0.03em', lineHeight: '1.05' }}
          >
            Revenue recovered.
          </h2>
        </div>

        {/* Stats with huge numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Card background with gradient */}
              <div className="relative p-10 rounded-2xl bg-gradient-to-br from-[#0070F3]/20 to-blue-400/10 border border-[#0070F3]/20 backdrop-blur-sm hover:from-[#0070F3]/30 hover:to-blue-400/20 transition-all duration-300 hover:translate-y-[-4px]">
                {/* Abstract circle decoration */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#0070F3]/10 rounded-full blur-3xl" />

                {/* Floating dots decoration */}
                <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[#0070F3]/40" />
                <div className="absolute bottom-8 right-8 w-3 h-3 rounded-full bg-[#0070F3]/30" />

                <div className="relative text-center">
                  <div className="text-6xl md:text-7xl font-bold text-white mb-3">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-lg font-normal" style={{ lineHeight: '1.7' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-blue-400/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400 font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-300">{testimonial.role}</div>
                  <div className="text-xs text-gray-400">{testimonial.category}</div>
                </div>
              </div>
              <p className="text-gray-200 leading-relaxed italic">&ldquo;{testimonial.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
