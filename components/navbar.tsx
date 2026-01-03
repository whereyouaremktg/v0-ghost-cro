"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Ghost } from "lucide-react"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#BFFF00] rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-lime-300">
            <Ghost className="w-5 h-5 text-gray-900" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-white">
            Ghost<span className="text-gray-400">CRO</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
            How it works
          </Link>
          <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
            Pricing
          </Link>
          <Link href="#social-proof" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
            Results
          </Link>
          <Link href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
            FAQ
          </Link>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="text-sm text-gray-400 hover:text-white transition-colors duration-300 hidden sm:block">
              Log in
            </button>
          </Link>
          <Link href="/signup">
            <button
              className="px-4 py-2 bg-[#BFFF00] hover:bg-lime-300 text-gray-900 text-sm font-medium rounded-full transition-all duration-300"
              style={{ boxShadow: '0 0 20px rgba(191, 255, 0, 0.2)' }}
            >
              Start Free
            </button>
          </Link>
        </div>
      </div>

      {/* Blur backdrop on scroll */}
      <div className={`absolute inset-0 -z-10 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50 transition-all duration-300 ${
        scrolled ? "opacity-100" : "opacity-0"
      }`} />
    </nav>
  )
}
