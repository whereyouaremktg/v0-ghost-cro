"use client"

import Link from "next/link"
import { Ghost } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b-3 border-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-foreground p-2 border-2 border-foreground">
              <Ghost className="w-5 h-5 text-background" strokeWidth={3} />
            </div>
            <span className="font-bold text-lg uppercase tracking-tight">Ghost CRO</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
            >
              FAQ
            </Link>
          </div>

          {/* Login Button */}
          <Link href="/login">
            <Button
              variant="outline"
              className="border-2 border-foreground font-bold uppercase tracking-wide hover:bg-foreground hover:text-background transition-all bg-transparent"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
